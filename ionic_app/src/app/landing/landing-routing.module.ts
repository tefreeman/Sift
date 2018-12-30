import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { LoginComponent } from './login/login.component';
import { LoadingComponent } from './loading/loading.component';
import { SignUpComponent } from './sign-up/sign-up.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' }
const routes: Routes = [
  { path: '', component: LoadingComponent },
  { path: 'login', component: LoginComponent},
  { path: 'sign-up', component: SignUpComponent},
  { path: 'start', component: StartScreenComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule {}
