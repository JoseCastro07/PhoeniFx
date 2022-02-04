import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewImagenComponent } from './new-imagen.component';

describe('NewImagenComponent', () => {
  let component: NewImagenComponent;
  let fixture: ComponentFixture<NewImagenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewImagenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewImagenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
