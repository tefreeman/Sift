import { StartScreenComponent } from "./start-screen/start-screen.component";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";


// { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' }
const routes: Routes = [
   { path: "", component: StartScreenComponent },
   { path: "login", component: LoginComponent },
   { path: "sign-up", component: SignUpComponent },
   { path: "profile", loadChildren: "./profile/profile.module#ProfileModule" }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class LandingRoutingModule {
}
