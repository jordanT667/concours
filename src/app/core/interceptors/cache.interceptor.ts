import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, HttpResponse<unknown>>();

const URLS_EXCLUES = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/inscriptions',
];

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne cacher que les requêtes GET
  if (req.method !== 'GET') {
    cache.clear();
    return next(req);
  }

  // Ne pas cacher les URLs sensibles ou paginées
  const exclure = URLS_EXCLUES.some(url => req.url.includes(url));
  if (exclure) {
    return next(req);
  }

  // Réponse déjà en cache → retourner directement
  const cached = cache.get(req.url);
  if (cached) {
    return of(cached.clone());
  }

  // Laisser partir la requête et sauvegarder la réponse
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, event.clone());
      }
    })
  );
};
