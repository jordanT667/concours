import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonceFrom } from './annonce-from';

describe('AnnonceFrom', () => {
  let component: AnnonceFrom;
  let fixture: ComponentFixture<AnnonceFrom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonceFrom],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnonceFrom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
