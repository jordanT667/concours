import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepFinish } from './step-finish';

describe('StepFinish', () => {
  let component: StepFinish;
  let fixture: ComponentFixture<StepFinish>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepFinish],
    }).compileComponents();

    fixture = TestBed.createComponent(StepFinish);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
