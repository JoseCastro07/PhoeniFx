import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListEtapaComponent } from './list-etapa.component';

describe('ListEtapaComponent', () => {
  let component: ListEtapaComponent;
  let fixture: ComponentFixture<ListEtapaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListEtapaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEtapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
