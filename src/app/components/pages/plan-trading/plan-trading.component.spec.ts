import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanTradingComponent } from './plan-trading.component';

describe('PlanTradingComponent', () => {
  let component: PlanTradingComponent;
  let fixture: ComponentFixture<PlanTradingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanTradingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanTradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
