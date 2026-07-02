import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentreForm } from './centre-form';

describe('CentreForm', () => {
  let component: CentreForm;
  let fixture: ComponentFixture<CentreForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentreForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CentreForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
