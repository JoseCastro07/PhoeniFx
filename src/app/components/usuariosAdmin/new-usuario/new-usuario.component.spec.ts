import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewUsuarioComponent } from './new-usuario.component';

describe('NewUsuarioComponent', () => {
  let component: NewUsuarioComponent;
  let fixture: ComponentFixture<NewUsuarioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewUsuarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
