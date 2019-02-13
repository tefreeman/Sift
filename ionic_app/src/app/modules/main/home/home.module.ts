import { HomeComponent } from './home.component';
import { MapsComponent } from './maps/maps.component';
import { HeaderComponent } from './header/header.component';
import { HomeRoutingModule } from './home-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GoogleMaps } from '@ionic-native/google-maps/ngx';
import { IonicModule } from '@ionic/angular';
import { SiftBarComponent } from './sift-bar/sift-bar.component';
import { SiftModalComponent } from './sift-modal/sift-modal.component';
import { FilterNutrientsComponent } from './sift-modal/filter-nutrients/filter-nutrients.component';
import { FilterPriceComponent } from './sift-modal/filter-price/filter-price.component';
import { FilterReviewsComponent } from './sift-modal/filter-reviews/filter-reviews.component';
import { FilterDistanceComponent } from './sift-modal/filter-distance/filter-distance.component';

@NgModule({
    declarations: [HeaderComponent, MapsComponent, HomeComponent, SiftBarComponent, SiftModalComponent, FilterNutrientsComponent, FilterPriceComponent, FilterReviewsComponent, FilterDistanceComponent],
    imports: [CommonModule, IonicModule, HomeRoutingModule],
    providers: [],
    entryComponents: [SiftModalComponent]
})
export class HomeModule {}
