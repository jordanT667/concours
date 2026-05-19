import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepRecommandation } from './step-recommandation';

describe('StepRecommandation', () => {
  let component: StepRecommandation;
  let fixture: ComponentFixture<StepRecommandation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepRecommandation],
    }).compileComponents();

    fixture = TestBed.createComponent(StepRecommandation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
