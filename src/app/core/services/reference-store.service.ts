import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of, retry, timer, catchError, tap, map } from 'rxjs';
import { ConcoursReferenceService } from './concours-reference.service';
import { PaysDto } from '../models/pays.models';
import {
  CursusDto, NiveauDto, DiplomeDto, LangueDto,
  MentionDto, BanqueDto, CentreExamenDto, SiteDepotDto,
  SportDto, LoisirDto, HandicapDto, EcoleDto
} from '../models/referentiel.models';

export interface ReferenceData {
  cursus: CursusDto[];
  niveaux: NiveauDto[];
  diplomes: DiplomeDto[];
  pays: PaysDto[];
  langues: LangueDto[];
  mentions: MentionDto[];
  banques: BanqueDto[];
  centres: CentreExamenDto[];
  sites: SiteDepotDto[];
  sports: SportDto[];
  loisirs: LoisirDto[];
  handicaps: HandicapDto[];
  ecoles: EcoleDto[];
}

export type RefStatus = 'idle' | 'loading' | 'ready' | 'partial' | 'error';

const DB_NAME = 'concours_ref';
const STORE_NAME = 'reference_data';
const DB_VERSION = 1;
const TTL_MS = 24 * 60 * 60 * 1000;

function emptyRef(): ReferenceData {
  return { cursus: [], niveaux: [], diplomes: [], pays: [], langues: [], mentions: [], banques: [], centres: [], sites: [], sports: [], loisirs: [], handicaps: [], ecoles: [] };
}

@Injectable({ providedIn: 'root' })
export class ReferenceStore {

  private data$ = new BehaviorSubject<ReferenceData>(emptyRef());
  private status$ = new BehaviorSubject<RefStatus>('idle');
  private errors$ = new BehaviorSubject<string[]>([]);
  private loaded = false;

  readonly reference$ = this.data$.asObservable();
  readonly refStatus$ = this.status$.asObservable();
  readonly refErrors$ = this.errors$.asObservable();

  constructor(private ref: ConcoursReferenceService) {}

  get snapshot(): ReferenceData { return this.data$.value; }
  get isReady(): boolean { return this.loaded; }

  load(force = false): Observable<ReferenceData> {
    if (this.loaded && !force) return of(this.data$.value);
    if (this.status$.value === 'loading') return this.data$.asObservable();

    this.status$.next('loading');
    this.errors$.next([]);

    return new Observable<ReferenceData>(subscriber => {
      this.loadFromIndexedDB().then(cached => {
        if (cached && !force) {
          this.data$.next(cached);
          this.loaded = true;
          this.status$.next('ready');
          subscriber.next(cached);
          subscriber.complete();
          this.refreshInBackground();
        } else {
          this.fetchFromServer().subscribe({
            next: (data) => {
              subscriber.next(data);
              subscriber.complete();
            },
            error: (err) => {
              if (cached) {
                this.data$.next(cached);
                this.loaded = true;
                this.status$.next('partial');
                subscriber.next(cached);
                subscriber.complete();
              } else {
                subscriber.error(err);
              }
            }
          });
        }
      });
    });
  }

  private fetchFromServer(): Observable<ReferenceData> {
    const retryConfig = { count: 3, delay: (err: any, i: number) => timer(1000 * Math.pow(2, i - 1)) };

    const safe = <T>(obs: Observable<T[]>, label: string): Observable<T[]> =>
      obs.pipe(
        retry(retryConfig),
        catchError(() => {
          this.errors$.next([...this.errors$.value, label]);
          return of([] as T[]);
        })
      );

    return forkJoin({
      cursus: safe(this.ref.getCursus(), 'cursus'),
      niveaux: safe(this.ref.getNiveaux(), 'niveaux'),
      diplomes: safe(this.ref.getAllDiplomes(), 'diplomes'),
      pays: safe(this.ref.getPays(), 'pays'),
      langues: safe(this.ref.getLangues(), 'langues'),
      mentions: safe(this.ref.getMentions(), 'mentions'),
      banques: safe(this.ref.getBanques(), 'banques'),
      centres: safe(this.ref.getCentresExamen(), 'centres'),
      sites: safe(this.ref.getSitesDepot(), 'sites'),
      sports: safe(this.ref.getSports(), 'sports'),
      loisirs: safe(this.ref.getLoisirs(), 'loisirs'),
      handicaps: safe(this.ref.getHandicaps(), 'handicaps'),
      ecoles: safe(this.ref.getEcoles(), 'ecoles'),
    }).pipe(
      tap(data => {
        this.data$.next(data);
        this.loaded = true;

        const errors = this.errors$.value;
        if (errors.length === 0) {
          this.status$.next('ready');
        } else {
          this.status$.next('partial');
        }

        this.saveToIndexedDB(data);
      })
    );
  }

  private refreshInBackground(): void {
    this.fetchFromServer().subscribe();
  }

  // --- IndexedDB ---

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { reject('No IndexedDB'); return; }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToIndexedDB(data: ReferenceData): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ data, timestamp: Date.now() }, 'ref');
      db.close();
    } catch {}
  }

  private async loadFromIndexedDB(): Promise<ReferenceData | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get('ref');
        req.onsuccess = () => {
          db.close();
          const entry = req.result;
          if (!entry) { resolve(null); return; }
          if (Date.now() - entry.timestamp > TTL_MS) { resolve(null); return; }
          resolve(entry.data as ReferenceData);
        };
        req.onerror = () => { db.close(); resolve(null); };
      });
    } catch {
      return null;
    }
  }

  invalidate(): void {
    this.loaded = false;
    this.data$.next(emptyRef());
    this.status$.next('idle');
    if (typeof indexedDB !== 'undefined') {
      this.openDB().then(db => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete('ref');
        db.close();
      }).catch(() => {});
    }
  }
}
