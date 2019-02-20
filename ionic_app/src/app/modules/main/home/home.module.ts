import { HomeComponent } from './home.component';
import { MapsComponent } from './maps/maps.component';
import { HeaderComponent } from './header/header.component';
import { HomeRoutingModule } from './home-routing.module';
import { CommonModule } from "@angular/common";
import { GoogleMaps } from '@ionic-native/google-maps/ngx';
import { SiftBarComponent } from './sift-bar/sift-bar.component';
import { SiftModalComponent } from './sift-modal/sift-modal.component';
import { FilterNutrientsComponent } from './sift-modal/filter-nutrients/filter-nutrients.component';
import { FilterPriceComponent } from './sift-modal/filter-price/filter-price.component';
import { FilterReviewsComponent } from './sift-modal/filter-reviews/filter-reviews.component';
import { FilterDistanceComponent } from './sift-modal/filter-distance/filter-distance.component';
import { ItemsListComponent } from './items-list/items-list.component';
import { ItemComponent } from './items-list/item/item.component';
import { SortBarComponent } from './sort-bar/sort-bar.component';
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

@NgModule({
    declarations: [HeaderComponent, MapsComponent, HomeComponent, SiftBarComponent, SiftModalComponent, FilterNutrientsComponent, FilterPriceComponent, FilterReviewsComponent, FilterDistanceComponent, ItemsListComponent, ItemComponent, SortBarComponent],
    imports: [CommonModule, IonicModule, HomeRoutingModule, VirtualScrollerModule],
    providers: [],
    entryComponents: [SiftModalComponent]
})
export class HomeModule {}
