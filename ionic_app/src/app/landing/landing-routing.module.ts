import { LoadingComponent } from './loading/loading.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' }
const routes: Routes = [
  { path: '', component: LoadingComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule {}
