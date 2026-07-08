import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiliereForm } from './filiere-form';

describe('FiliereForm', () => {
  let component: FiliereForm;
  let fixture: ComponentFixture<FiliereForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiliereForm],
    }).compileComponents();

    fixture = TestBed.createComponent(FiliereForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
