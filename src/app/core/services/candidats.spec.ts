import { TestBed } from '@angular/core/testing';

import { Candidats } from './candidats';

describe('Candidats', () => {
  let service: Candidats;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Candidats);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
