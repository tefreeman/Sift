import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDistanceComponent } from './filter-distance.component';

describe('FilterDistanceComponent', () => {
  let component: FilterDistanceComponent;
  let fixture: ComponentFixture<FilterDistanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDistanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
