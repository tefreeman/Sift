import { environment } from "src/environments/environment";

import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { File } from "@ionic-native/file/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { NativeStorage } from "@ionic-native/native-storage/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LandingModule } from "./modules/start/landing.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import "hammerjs";

declare var Hammer: any;

export class MyHammerConfig extends HammerGestureConfig {
   buildHammer(element: HTMLElement) {
      let mc = new Hammer(element, {
         touchAction: "pan-y"
      });
      return mc;
   }
}

@NgModule({
   declarations: [AppComponent],
   entryComponents: [],
   imports: [BrowserModule, HttpClientModule, AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule, AngularFireAuthModule, AngularFireStorageModule, LandingModule, IonicModule.forRoot(), AppRoutingModule, BrowserAnimationsModule],
   providers: [
      StatusBar,
      SplashScreen,
      Geolocation,
      File,
      NativeStorage,
      {
         provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig
      },
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
   ],
   bootstrap: [AppComponent]
})
export class AppModule {
}
