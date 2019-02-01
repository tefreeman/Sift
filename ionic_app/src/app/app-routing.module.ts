import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

// { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' }
const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'start', loadChildren: './modules/start/landing.module#LandingModule' },
  { path: 'home', loadChildren: './modules/home/home.module#HomeModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
