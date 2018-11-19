import { HomeComponent } from './home/home.component';
import { MainPage } from './main.page';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';

const mainRoutes: Routes = [
  { path: 'main', component: MainPage, children: [
      {path: '', component: HomeComponent}
  ]},
];

@NgModule({
  imports: [RouterModule.forChild(mainRoutes)],
exports: [RouterModule]
})
export class MainRoutingModule { }
