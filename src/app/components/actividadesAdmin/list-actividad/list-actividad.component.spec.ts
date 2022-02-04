import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListActividadComponent } from './list-actividad.component';

describe('ListActividadComponent', () => {
  let component: ListActividadComponent;
  let fixture: ComponentFixture<ListActividadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListActividadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListActividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
