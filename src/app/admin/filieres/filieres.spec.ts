import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Filieres } from './filieres';

describe('Filieres', () => {
  let component: Filieres;
  let fixture: ComponentFixture<Filieres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Filieres],
    }).compileComponents();

    fixture = TestBed.createComponent(Filieres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
