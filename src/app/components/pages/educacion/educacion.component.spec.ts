import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EducacionComponent } from './educacion.component';

describe('EducacionComponent', () => {
  let component: EducacionComponent;
  let fixture: ComponentFixture<EducacionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EducacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
