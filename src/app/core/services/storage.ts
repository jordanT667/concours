import { Injectable } from '@angular/core';

export const STORAGE_KEYS = {
  // Wizard
  CURRENT_STEP:     'enstmo_current_step',
  IDENTIFICATION:   'enstmo_identification',
  SPECIALISATION:   'enstmo_specialisation',
  CURSUS:           'enstmo_cursus',
  CONTACTS:         'enstmo_contacts',
  NUMERO_DOSSIER:   'enstmo_numero_dossier',
  // Auth
  ACCESS_TOKEN:     'accessToken',
  REFRESH_TOKEN:    'refreshToken',
  USER:             'user',
  // Admin
  ANNONCES:         'estm_annonces',
  PARAMETRES:       'parametres_site',
};

@Injectable({ providedIn: 'root' })
export class StorageService {

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const val = localStorage.getItem(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  }

  set(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  clearWizard(): void {
    [
      STORAGE_KEYS.CURRENT_STEP,
      STORAGE_KEYS.IDENTIFICATION,
      STORAGE_KEYS.SPECIALISATION,
      STORAGE_KEYS.CURSUS,
      STORAGE_KEYS.CONTACTS,
      STORAGE_KEYS.NUMERO_DOSSIER,
    ].forEach(k => this.remove(k));
  }

  clearAuth(): void {
    [
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ].forEach(k => this.remove(k));
  }
}
