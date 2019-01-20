import { ProfileComponent } from './profile.component';
import { FoodAvoidsComponent } from './food-avoids/food-avoids.component';
import { HistoryComponent } from './history/history.component';
import { GoalsComponent } from './goals/goals.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MeComponent } from './me/me.component';
import { TasteGameComponent } from './taste-game/taste-game.component';


// { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' }
const routes: Routes = [
  { path: '', component: ProfileComponent},
  { path: 'goals', component:  GoalsComponent},
  { path: 'me', component:  MeComponent},
  { path: 'history', component: HistoryComponent},
  { path: 'taste', component: TasteGameComponent},
  { path: 'avoids', component: FoodAvoidsComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
