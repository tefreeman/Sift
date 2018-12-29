import { MainViewRoutingModule } from './main-view-routing.module';
import { MainViewComponent } from './main-view.component';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { TabBarComponent } from './tab-bar/tab-bar.component';

@NgModule({
  declarations: [MainViewComponent, HeaderComponent, TabBarComponent],
  imports: [
    CommonModule,
    IonicModule,
    MainViewRoutingModule
  ]
})
export class MainViewModule { }
