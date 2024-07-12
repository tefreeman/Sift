import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiftModalComponent } from './sift-modal.component';

describe('SiftModalComponent', () => {
  let component: SiftModalComponent;
  let fixture: ComponentFixture<SiftModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiftModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiftModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
