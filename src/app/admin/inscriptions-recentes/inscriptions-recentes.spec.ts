import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionsRecentes } from './inscriptions-recentes';

describe('InscriptionsRecentes', () => {
  let component: InscriptionsRecentes;
  let fixture: ComponentFixture<InscriptionsRecentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionsRecentes],
    }).compileComponents();

    fixture = TestBed.createComponent(InscriptionsRecentes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
