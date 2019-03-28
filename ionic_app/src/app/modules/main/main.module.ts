import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";

import { MainRoutingModule } from "./main-routing.module";
import { MainPageComponent } from "./main.page";

@NgModule({
   declarations: [MainPageComponent],
   imports: [CommonModule, IonicModule, MainRoutingModule],
   providers: []
})
export class MainModule {
}
