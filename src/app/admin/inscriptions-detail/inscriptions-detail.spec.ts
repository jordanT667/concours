import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionsDetail } from './inscriptions-detail';

describe('InscriptionsDetail', () => {
  let component: InscriptionsDetail;
  let fixture: ComponentFixture<InscriptionsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionsDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(InscriptionsDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
