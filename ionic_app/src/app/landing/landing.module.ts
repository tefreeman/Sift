import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Network} from '@ionic-native/network/ngx';

import { LandingRoutingModule } from './landing-routing.module';
import { LoadingComponent } from './loading/loading.component';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [LoginComponent, SignUpComponent, StartScreenComponent, LoadingComponent],
  imports: [
    CommonModule,
    IonicModule,
    LandingRoutingModule
  ],
  providers: [Network]
})
export class LandingModule { }
