import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiftBarComponent } from './sift-bar.component';

describe('SiftBarComponent', () => {
  let component: SiftBarComponent;
  let fixture: ComponentFixture<SiftBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiftBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiftBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
