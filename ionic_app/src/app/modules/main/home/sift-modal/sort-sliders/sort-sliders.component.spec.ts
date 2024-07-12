import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SortSlidersComponent } from './sort-sliders.component';

describe('SortSlidersComponent', () => {
  let component: SortSlidersComponent;
  let fixture: ComponentFixture<SortSlidersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SortSlidersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortSlidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
