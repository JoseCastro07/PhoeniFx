import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewEtapaComponent } from './new-etapa.component';

describe('NewEtapasComponent', () => {
  let component: NewEtapaComponent;
  let fixture: ComponentFixture<NewEtapaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewEtapaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEtapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
