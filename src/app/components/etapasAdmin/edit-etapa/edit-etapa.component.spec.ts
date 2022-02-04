import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditEtapaComponent } from './edit-etapa.component';

describe('EditEtapasComponent', () => {
  let component: EditEtapaComponent;
  let fixture: ComponentFixture<EditEtapaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEtapaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEtapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
