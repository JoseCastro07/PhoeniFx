import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContainerAppComponent } from './container-app.component';

describe('ContainerAppComponent', () => {
  let component: ContainerAppComponent;
  let fixture: ComponentFixture<ContainerAppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
