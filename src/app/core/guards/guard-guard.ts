import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth'

/**
 * Protège toutes les routes /admin/**
 * L'utilisateur doit être connecté ET avoir le rôle ADMIN ou SAISIE.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const roles = authService.getRoles();
  if (!roles.includes('ADMIN') && !roles.includes('SAISIE')) {
    return router.createUrlTree(['/login']);
  }

  return true;
};

/**
 * Protège les routes réservées aux ADMIN uniquement (référentiels, sessions, paramètres).
 * Un SAISIE connecté est redirigé vers le dashboard avec un message d'accès refusé.
 */
export const adminOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (!authService.isAdmin()) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return true;
};

