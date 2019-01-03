import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodAvoidsComponent } from './food-avoids.component';

describe('FoodAvoidsComponent', () => {
  let component: FoodAvoidsComponent;
  let fixture: ComponentFixture<FoodAvoidsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodAvoidsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodAvoidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
