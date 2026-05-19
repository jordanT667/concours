import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepSpecialisation } from './step-specialisation';

describe('StepSpecialisation', () => {
  let component: StepSpecialisation;
  let fixture: ComponentFixture<StepSpecialisation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepSpecialisation],
    }).compileComponents();

    fixture = TestBed.createComponent(StepSpecialisation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
