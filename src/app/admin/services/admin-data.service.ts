import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, shareReplay, of } from 'rxjs';
import { PreinscriptionService } from '../../core/services/preinscription.service';
import { PreinscriptionDto } from '../../core/models/preinscription.models';

@Injectable({ providedIn: 'root' })
export class AdminDataService {

  private cache$ = new BehaviorSubject<PreinscriptionDto[] | null>(null);
  private lastAnnee = '';
  private lastFetch = 0;
  private inflight$: Observable<PreinscriptionDto[]> | null = null;

  private readonly TTL_MS = 30_000;

  constructor(private preinscriptionService: PreinscriptionService) {}

  getAll(anneeAcademique: string, forceRefresh = false): Observable<PreinscriptionDto[]> {
    const now = Date.now();
    const cached = this.cache$.value;

    if (
      !forceRefresh &&
      cached !== null &&
      this.lastAnnee === anneeAcademique &&
      (now - this.lastFetch) < this.TTL_MS
    ) {
      return of(cached);
    }

    if (this.inflight$ && this.lastAnnee === anneeAcademique && !forceRefresh) {
      return this.inflight$;
    }

    this.lastAnnee = anneeAcademique;
    this.inflight$ = this.preinscriptionService.getAll(anneeAcademique).pipe(
      tap(data => {
        this.cache$.next(data);
        this.lastFetch = Date.now();
        this.inflight$ = null;
      }),
      shareReplay(1)
    );

    return this.inflight$;
  }

  invalidate(): void {
    this.cache$.next(null);
    this.lastFetch = 0;
    this.inflight$ = null;
  }

  getById(id: number, anneeAcademique: string): Observable<PreinscriptionDto | undefined> {
    return new Observable(subscriber => {
      this.getAll(anneeAcademique).subscribe({
        next: (list) => {
          subscriber.next(list.find(p => p.idPreins === id));
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }
}
