import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService implements OnDestroy {
  /** true = modale d'avertissement visible */
  showWarning$ = new BehaviorSubject<boolean>(false);

  /** secondes restantes affichées dans la modale */
  secondesRestantes$ = new BehaviorSubject<number>(120);

  private readonly WARNING_BEFORE_MS = 2 * 60 * 1000; // 2 min avant expiration
  private checkSub?: Subscription;
  private countdownSub?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  start(): void {
    this.stop();
    // Vérification toutes les 30 secondes
    this.checkSub = interval(30_000).subscribe(() => this.check());
    this.check();
  }

  stop(): void {
    this.checkSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
    this.showWarning$.next(false);
  }

  resterConnecte(): void {
    this.authService.refreshToken().subscribe({
      next: () => {
        this.showWarning$.next(false);
        this.countdownSub?.unsubscribe();
        this.check();
      },
      error: () => this.expirer(),
    });
  }

  expirer(): void {
    this.stop();
    this.authService.logout().subscribe({
      complete: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  private check(): void {
    const token = this.authService.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresMs = payload.exp * 1000;
      const remaining = expiresMs - Date.now();

      if (remaining <= 0) {
        this.expirer();
        return;
      }

      if (remaining <= this.WARNING_BEFORE_MS && !this.showWarning$.value) {
        this.showWarning$.next(true);
        this.startCountdown(Math.floor(remaining / 1000));
      }
    } catch {}
  }

  private startCountdown(seconds: number): void {
    this.secondesRestantes$.next(seconds);
    this.countdownSub?.unsubscribe();
    this.countdownSub = interval(1000).subscribe(() => {
      const s = this.secondesRestantes$.value - 1;
      if (s <= 0) {
        this.expirer();
      } else {
        this.secondesRestantes$.next(s);
      }
    });
  }

  ngOnDestroy(): void { this.stop(); }
}
