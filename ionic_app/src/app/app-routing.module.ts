import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' }
const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'start', loadChildren: './start/landing.module#LandingModule' },
  { path: 'home', loadChildren: './main-view/main-view.module#MainViewModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
