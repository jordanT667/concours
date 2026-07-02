import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepReccommandation } from './step-reccommandation';

describe('StepReccommandation', () => {
  let component: StepReccommandation;
  let fixture: ComponentFixture<StepReccommandation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepReccommandation],
    }).compileComponents();

    fixture = TestBed.createComponent(StepReccommandation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
