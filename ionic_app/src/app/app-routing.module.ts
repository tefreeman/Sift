import { LoginComponent } from './user/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { RegisterComponent } from './user/register/register.component';
import { MyAccountComponent } from './user/my-account/my-account.component';
import { AuthGuard } from './api/auth-guard.service';
import { LoadingComponent } from './loading/loading.component';
import { MainPage } from './main/main.page';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'loading', component: LoadingComponent},
  { path: 'register', component: RegisterComponent },
  { path: 'my-account', component: MyAccountComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
exports: [RouterModule]
})
export class AppRoutingModule { }
