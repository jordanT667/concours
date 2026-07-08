import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { STORAGE_KEYS } from '../services/storage';

// Chaque étape du wizard ne peut être accédée que si les étapes précédentes
// ont été complétées (leurs données existent dans le localStorage).
const hasData = (key: string): boolean =>
  typeof window !== 'undefined' && !!localStorage.getItem(key);

export const wizardIdentificationGuard: CanActivateFn = () => {
  // Étape 2 : accessible librement (juste après la recommandation)
  return true;
};

export const wizardSpecialisationGuard: CanActivateFn = () => {
  // Étape 3 : nécessite l'étape 2 (identification)
  if (hasData(STORAGE_KEYS.IDENTIFICATION)) return true;
  return inject(Router).createUrlTree(['/inscription/identification']);
};

export const wizardCursusGuard: CanActivateFn = () => {
  // Étape 4 : nécessite les étapes 2 et 3
  if (hasData(STORAGE_KEYS.IDENTIFICATION) && hasData(STORAGE_KEYS.SPECIALISATION)) return true;
  return inject(Router).createUrlTree(['/inscription/identification']);
};

export const wizardContactsGuard: CanActivateFn = () => {
  // Étape 5 : nécessite les étapes 2, 3 et 4
  if (
    hasData(STORAGE_KEYS.IDENTIFICATION) &&
    hasData(STORAGE_KEYS.SPECIALISATION) &&
    hasData(STORAGE_KEYS.CURSUS)
  ) return true;
  return inject(Router).createUrlTree(['/inscription/identification']);
};

export const wizardFinishGuard: CanActivateFn = () => {
  // Étape 6 : nécessite toutes les étapes précédentes
  // Si le dossier a déjà été soumis, on laisse passer pour re-télécharger le PDF
  if (hasData(STORAGE_KEYS.NUMERO_DOSSIER)) return true;
  if (
    hasData(STORAGE_KEYS.IDENTIFICATION) &&
    hasData(STORAGE_KEYS.SPECIALISATION) &&
    hasData(STORAGE_KEYS.CURSUS) &&
    hasData(STORAGE_KEYS.CONTACTS)
  ) return true;
  return inject(Router).createUrlTree(['/inscription/identification']);
};
