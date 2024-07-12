import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionGraphComponent } from './nutrition-graph.component';

describe('NutritionGraphComponent', () => {
  let component: NutritionGraphComponent;
  let fixture: ComponentFixture<NutritionGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NutritionGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NutritionGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
