import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnoncesBanner } from './annonces-banner';

describe('AnnoncesBanner', () => {
  let component: AnnoncesBanner;
  let fixture: ComponentFixture<AnnoncesBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnoncesBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnoncesBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
