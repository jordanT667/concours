import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from './auth';

// État partagé entre les requêtes concurrentes
let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Ne pas intercepter les appels d'auth eux-mêmes
  if (isAuthCall(req.url)) {
    return next(req);
  }

  return next(attachToken(req, auth.getToken())).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        return handle401(req, next, auth, router);
      }
      return throwError(() => err);
    })
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router
): Observable<any> {

  if (isRefreshing) {
    // Une requête de refresh est déjà en cours : attendre le nouveau token
    return refreshDone$.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(attachToken(req, token)))
    );
  }

  isRefreshing = true;
  refreshDone$.next(null);

  return auth.refreshToken().pipe(
    switchMap((res: any) => {
      const newToken: string = res.accessToken;
      refreshDone$.next(newToken);
      return next(attachToken(req, newToken));
    }),
    catchError(refreshErr => {
      // Refresh échoué → session expirée, on déconnecte
      localStorage.clear();
      router.navigate(['/login']);
      return throwError(() => refreshErr);
    }),
    finalize(() => {
      isRefreshing = false;
    })
  );
}

function attachToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function isAuthCall(url: string): boolean {
  return url.includes('/auth/login')
    || url.includes('/auth/refresh')
    || url.includes('/auth/logout');
}
