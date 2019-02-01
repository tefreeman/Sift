import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainPageComponent } from './main.page';

// { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' }
const routes: Routes = [
    {
        path: '',
        component: MainPageComponent,
        children: [
            {
                path: 'home',
                loadChildren: './home/home.module#HomeModule'
            },
            {
                path: 'profile',
                loadChildren: './home/home.module#HomeModule'
            },
            {
                path: 'settings',
                loadChildren: './home/home.module#HomeModule'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainRoutingModule {}
