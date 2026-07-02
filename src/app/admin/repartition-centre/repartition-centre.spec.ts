import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepartitionCentre } from './repartition-centre';

describe('RepartitionCentre', () => {
  let component: RepartitionCentre;
  let fixture: ComponentFixture<RepartitionCentre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepartitionCentre],
    }).compileComponents();

    fixture = TestBed.createComponent(RepartitionCentre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
