import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepIdentification } from './step-identification';

describe('StepIdentification', () => {
  let component: StepIdentification;
  let fixture: ComponentFixture<StepIdentification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepIdentification],
    }).compileComponents();

    fixture = TestBed.createComponent(StepIdentification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
