import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCursus } from './step-cursus';

describe('StepCursus', () => {
  let component: StepCursus;
  let fixture: ComponentFixture<StepCursus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepCursus],
    }).compileComponents();

    fixture = TestBed.createComponent(StepCursus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
