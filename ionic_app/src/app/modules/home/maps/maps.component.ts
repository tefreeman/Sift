import { Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import {GoogleMaps, GoogleMap, Environment} from '@ionic-native/google-maps/ngx';
@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {

  map: GoogleMap;
  constructor(private platform: Platform) { }

  async ngOnInit() {
    await this.platform.ready();
    await this.loadMap();
  }

  loadMap() {
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCnpxUKLVpYuLOXAtm_nYeKvNsVH3vgDNk',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCnpxUKLVpYuLOXAtm_nYeKvNsVH3vgDNk'
    });

    this.map = GoogleMaps.create('map_canvas');
  }
}
