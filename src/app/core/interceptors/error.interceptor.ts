import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse, ErrorCode } from '../models/error-response.models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((httpErr: HttpErrorResponse) => {
      const apiError: ErrorResponse | null =
        httpErr.error && typeof httpErr.error === 'object' && 'code' in httpErr.error
          ? (httpErr.error as ErrorResponse)
          : null;

      // 403 → accès refusé, retour au dashboard
      if (httpErr.status === 403 && apiError?.code === ErrorCode.FORBIDDEN_ACCESS) {
        router.navigate(['/admin/dashboard']);
      }

      // On relance avec l'ErrorResponse parsé pour que les composants puissent l'utiliser
      return throwError(() => apiError ?? httpErr);
    })
  );
};
