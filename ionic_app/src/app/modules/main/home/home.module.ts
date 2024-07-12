import { HomeComponent } from "./home.component";
import { MapsComponent } from "./maps/maps.component";
import { HeaderComponent } from "./header/header.component";
import { HomeRoutingModule } from "./home-routing.module";
import { CommonModule } from "@angular/common";
import { SiftBarComponent } from "./sift-bar/sift-bar.component";
import { SiftModalComponent } from "./sift-modal/sift-modal.component";
import { FilterNutrientsComponent } from "./sift-modal/filter-nutrients/filter-nutrients.component";
import { FilterPriceComponent } from "./sift-modal/filter-price/filter-price.component";
import { FilterReviewsComponent } from "./sift-modal/filter-reviews/filter-reviews.component";
import { FilterDistanceComponent } from "./sift-modal/filter-distance/filter-distance.component";
import { RestaurantsListComponent } from "./restaurants-list/restaurants-list.component";
import { RestaurantComponent } from "./restaurants-list/restaurant/restaurant.component";
import { SortBarComponent } from "./sort-bar/sort-bar.component";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { VirtualScrollerModule } from "ngx-virtual-scroller";
import { FormsModule } from "@angular/forms";
import { RestaurantDetailedModalComponent } from "./restaurant-detailed-modal/restaurant-detailed-modal.component";
import { GalleryModule } from "@ngx-gallery/core";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NutritionGraphComponent } from "./restaurant-detailed-modal/nutrition-graph/nutrition-graph.component";
import { SortSlidersComponent } from "./sift-modal/sort-sliders/sort-sliders.component";
import { ItemsListComponent } from "./items-list/items-list.component";
import { ItemComponent } from "./items-list/item/item.component";
import { FilterIngredientsComponent } from "./sift-modal/filter-ingredients/filter-ingredients.component";
import { ImageSliderComponent } from './restaurant-detailed-modal/image-slider/image-slider.component';

@NgModule({
   declarations: [HeaderComponent, MapsComponent, HomeComponent, SiftBarComponent, SiftModalComponent,
      FilterNutrientsComponent, FilterPriceComponent, FilterReviewsComponent, FilterDistanceComponent,
      RestaurantsListComponent, RestaurantComponent, SortBarComponent, RestaurantDetailedModalComponent, NutritionGraphComponent, SortSlidersComponent, ItemsListComponent, ItemComponent, FilterIngredientsComponent, ImageSliderComponent],
   imports: [CommonModule, IonicModule, HomeRoutingModule, VirtualScrollerModule,
      FormsModule, GalleryModule, NgxChartsModule],
   providers: [],
   entryComponents: [SiftModalComponent, RestaurantDetailedModalComponent]
})
export class HomeModule {
}
