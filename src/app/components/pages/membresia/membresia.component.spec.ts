import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MembresiaComponent } from './membresia.component';

describe('MembresiaComponent', () => {
  let component: MembresiaComponent;
  let fixture: ComponentFixture<MembresiaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MembresiaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembresiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
