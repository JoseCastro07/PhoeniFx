import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditVideoComponent } from './edit-video.component';

describe('EditVideoComponent', () => {
  let component: EditVideoComponent;
  let fixture: ComponentFixture<EditVideoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
