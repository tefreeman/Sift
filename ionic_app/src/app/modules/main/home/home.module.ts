import { HomeComponent } from './home.component';
import { MapsComponent } from './maps/maps.component';
import { HeaderComponent } from './header/header.component';
import { HomeRoutingModule } from './home-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GoogleMaps } from '@ionic-native/google-maps/ngx';
import { IonicModule } from '@ionic/angular';
import { SiftBarComponent } from './sift-bar/sift-bar.component';
import { SiftActionSheetComponent } from './sift-action-sheet/sift-action-sheet.component';

@NgModule({
    declarations: [HeaderComponent, MapsComponent, HomeComponent, SiftBarComponent, SiftActionSheetComponent],
    imports: [CommonModule, IonicModule, HomeRoutingModule],
    providers: [],
})
export class HomeModule {}
