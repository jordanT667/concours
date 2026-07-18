import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { STORAGE_KEYS } from '../services/storage';


const hasData = (key: string): boolean =>
  typeof window !== 'undefined' && !!localStorage.getItem(key);

export const wizardIdentificationGuard: CanActivateFn = () => {
 
  return true;
};

export const wizardSpecialisationGuard: CanActivateFn = () => {
  
  if (hasData(STORAGE_KEYS.IDENTIFICATION)) return true;
  return inject(Router).createUrlTree(['/inscription/identification']);
};

export const wizardCursusGuard: CanActivateFn = () => {
 
  if (hasData(STORAGE_KEYS.IDENTIFICATION) && hasData(STORAGE_KEYS.SPECIALISATION)) return true;
  return inject(Router).createUrlTree(['/inscription/identification']);
};

export const wizardContactsGuard: CanActivateFn = () => {
 4
  if (
    hasData(STORAGE_KEYS.IDENTIFICATION) &&
    hasData(STORAGE_KEYS.SPECIALISATION) &&
    hasData(STORAGE_KEYS.CURSUS)
  ) return true;
  return inject(Router).createUrlTree(['/inscription/identification']);
};

export const wizardFinishGuard: CanActivateFn = () => {
  
  if (hasData(STORAGE_KEYS.NUMERO_DOSSIER)) return true;
  if (
    hasData(STORAGE_KEYS.IDENTIFICATION) &&
    hasData(STORAGE_KEYS.SPECIALISATION) &&
    hasData(STORAGE_KEYS.CURSUS) &&
    hasData(STORAGE_KEYS.CONTACTS)
  ) return true;
  return inject(Router).createUrlTree(['/inscription/identification']);
};
