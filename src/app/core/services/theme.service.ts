import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'enstmo_theme';

  private theme$ = new BehaviorSubject<Theme>(this.loadTheme());
  currentTheme$ = this.theme$.asObservable();

  constructor() {
    this.applyTheme(this.theme$.value);
  }

  toggle(): void {
    const next: Theme = this.theme$.value === 'light' ? 'dark' : 'light';
    this.theme$.next(next);
    this.applyTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, next);
    }
  }

  get isDark(): boolean {
    return this.theme$.value === 'dark';
  }

  private loadTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
  }
}
