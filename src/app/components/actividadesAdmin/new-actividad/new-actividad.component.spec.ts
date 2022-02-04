import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewActividadComponent } from './new-actividad.component';

describe('NewActividadComponent', () => {
  let component: NewActividadComponent;
  let fixture: ComponentFixture<NewActividadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewActividadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewActividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
