import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProcessUsuarioComponent } from './process-usuario.component';

describe('ProcessUsuarioComponent', () => {
  let component: ProcessUsuarioComponent;
  let fixture: ComponentFixture<ProcessUsuarioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessUsuarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
