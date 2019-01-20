import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { FoodAvoidsComponent } from './food-avoids/food-avoids.component';
import { GoalsComponent } from './goals/goals.component';
import { HistoryComponent } from './history/history.component';
import { MeComponent } from './me/me.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { TasteGameComponent } from './taste-game/taste-game.component';

@NgModule({
  declarations: [MeComponent, HistoryComponent, GoalsComponent, FoodAvoidsComponent, TasteGameComponent, ProfileComponent],
  imports: [
    CommonModule,
    IonicModule,
    ProfileRoutingModule,
  ],
  providers: []
})
export class ProfileModule {

  constructor() {

  }
 }
