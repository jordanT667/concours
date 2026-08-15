import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1000;

const URLS_EXCLUES = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/inscriptions',
  '/preinscriptions',
];

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    cache.clear();
    return next(req);
  }

  const exclure = URLS_EXCLUES.some(url => req.url.includes(url));
  if (exclure) {
    return next(req);
  }

  const cached = cache.get(req.url);
  if (cached && (Date.now() - cached.timestamp) < TTL_MS) {
    return of(cached.response.clone());
  }

  if (cached) cache.delete(req.url);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, { response: event.clone(), timestamp: Date.now() });
      }
    })
  );
};
