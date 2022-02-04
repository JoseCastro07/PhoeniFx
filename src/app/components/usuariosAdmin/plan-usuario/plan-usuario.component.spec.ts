import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanUsuarioComponent } from './plan-usuario.component';

describe('PlanUsuarioComponent', () => {
  let component: PlanUsuarioComponent;
  let fixture: ComponentFixture<PlanUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanUsuarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
