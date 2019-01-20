import { MainViewComponent } from './main-view.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' }
const routes: Routes = [
  { path: '', component: MainViewComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainViewRoutingModule {}
