import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ReferenceData, ReferenceStore } from '../services/reference-store.service';

export const referenceDataResolver: ResolveFn<ReferenceData> = () => {
  return inject(ReferenceStore).load();
};
