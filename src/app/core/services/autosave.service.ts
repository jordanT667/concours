import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Injectable({ providedIn: 'root' })
export class AutosaveService {
  status$ = new BehaviorSubject<AutosaveStatus>('idle');

  private trigger$ = new Subject<{ key: string; value: unknown }>();

  constructor() {
    this.trigger$.pipe(debounceTime(1800)).subscribe(({ key, value }) => {
      this.save(key, value);
    });
  }

  /** Déclenche une sauvegarde avec debounce de 1.8s */
  schedule(key: string, value: unknown): void {
    this.status$.next('saving');
    this.trigger$.next({ key, value });
  }

  /** Sauvegarde immédiate (utilisée au clic Suivant) */
  saveNow(key: string, value: unknown): void {
    this.save(key, value);
  }

  private save(key: string, value: unknown): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
      this.status$.next('saved');
      setTimeout(() => this.status$.next('idle'), 2500);
    } catch {
      this.status$.next('error');
    }
  }
}
