import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RestaurantsListComponent } from "./restaurants-list.component";

describe("RestaurantsListComponent", () => {
   let component: RestaurantsListComponent;
   let fixture: ComponentFixture<RestaurantsListComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         declarations: [RestaurantsListComponent]
      })
         .compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(RestaurantsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it("should create", () => {
      expect(component).toBeTruthy();
   });
});
