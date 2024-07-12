import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterNutrientsComponent } from './filter-nutrients.component';

describe('FilterNutrientsComponent', () => {
  let component: FilterNutrientsComponent;
  let fixture: ComponentFixture<FilterNutrientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterNutrientsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterNutrientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
