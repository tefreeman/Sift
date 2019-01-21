import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GoogleMaps } from '@ionic-native/google-maps/ngx';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from './header/header.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MapsComponent } from './maps/maps.component';
import { TabBarComponent } from './tab-bar/tab-bar.component';

@NgModule({
  declarations: [HomeComponent, HeaderComponent, TabBarComponent, MapsComponent],
  imports: [
    CommonModule,
    IonicModule,
   HomeRoutingModule
  ],
  providers: [GoogleMaps]
})
export class HomeModule { }
