import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditImagenComponent } from './edit-imagen.component';

describe('EditImagenComponent', () => {
  let component: EditImagenComponent;
  let fixture: ComponentFixture<EditImagenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditImagenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditImagenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
