import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantDetailedModalComponent } from './restaurant-detailed-modal.component';

describe('RestaurantDetailedModalComponent', () => {
  let component: RestaurantDetailedModalComponent;
  let fixture: ComponentFixture<RestaurantDetailedModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantDetailedModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantDetailedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
