import { MainViewRoutingModule } from './main-view-routing.module';
import { MainViewComponent } from './main-view.component';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { TabBarComponent } from './tab-bar/tab-bar.component';
import { MapsComponent } from './maps/maps.component';
import {GoogleMaps} from '@ionic-native/google-maps/ngx';
@NgModule({
  declarations: [MainViewComponent, HeaderComponent, TabBarComponent, MapsComponent],
  imports: [
    CommonModule,
    IonicModule,
    MainViewRoutingModule
  ],
  providers: [GoogleMaps]
})
export class MainViewModule { }
