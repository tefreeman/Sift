import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterIngredientsComponent } from './filter-ingredients.component';

describe('FilterIngredientsComponent', () => {
  let component: FilterIngredientsComponent;
  let fixture: ComponentFixture<FilterIngredientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterIngredientsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterIngredientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
