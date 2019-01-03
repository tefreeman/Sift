import { FoodAvoidsComponent } from './food-avoids/food-avoids.component';
import { GoalsComponent } from './goals/goals.component';
import { HistoryComponent } from './history/history.component';
import { MeComponent } from './me/me.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasteGameComponent } from './taste-game/taste-game.component';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [MeComponent, HistoryComponent, GoalsComponent, FoodAvoidsComponent, TasteGameComponent, ProfileComponent],
  imports: [
    CommonModule,
    IonicModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule {
  
  constructor() {

  }
 }
