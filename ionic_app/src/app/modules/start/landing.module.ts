import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Network} from '@ionic-native/network/ngx';

import { LandingRoutingModule } from './landing-routing.module';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [LoginComponent, SignUpComponent, StartScreenComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    LandingRoutingModule,
  ],
  providers: [Network]
})
export class LandingModule { }
