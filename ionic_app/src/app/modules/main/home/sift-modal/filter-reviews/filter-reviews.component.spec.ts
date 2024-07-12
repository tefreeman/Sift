import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterReviewsComponent } from './filter-reviews.component';

describe('FilterReviewsComponent', () => {
  let component: FilterReviewsComponent;
  let fixture: ComponentFixture<FilterReviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterReviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
