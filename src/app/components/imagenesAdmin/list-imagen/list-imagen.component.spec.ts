import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListImagenComponent } from './list-imagen.component';

describe('ListImagenComponent', () => {
  let component: ListImagenComponent;
  let fixture: ComponentFixture<ListImagenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListImagenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListImagenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
