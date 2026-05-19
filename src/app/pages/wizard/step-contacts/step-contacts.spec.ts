import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepContacts } from './step-contacts';

describe('StepContacts', () => {
  let component: StepContacts;
  let fixture: ComponentFixture<StepContacts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepContacts],
    }).compileComponents();

    fixture = TestBed.createComponent(StepContacts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
