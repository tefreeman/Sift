import { first, skip } from 'rxjs/operators';
import { log } from 'src/app/core/logger.service';

import { Component, OnInit } from '@angular/core';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import {
    Environment, GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, Marker
} from '@ionic-native/google-maps/ngx';
import { Platform } from '@ionic/angular';

import { GpsService } from '../../../core/services/gps.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  marker: Marker;
  map: GoogleMap;
  constructor(private platform: Platform, private gpsService: GpsService) { 
  
  }

  async ngOnInit() {
    log('waiting platform rdy');
    await this.platform.ready();
    log('platform rdy');
    await this.loadMap();
    log('loadMap');

    this.gpsService.getGpsCoords$().pipe(first()).subscribe(geoPosition => { 
      this.marker = this.map.addMarkerSync({
        title: 'You',
        icon: 'blue',
        animation: 'BOUNCE',
        position: {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude
        }
      });
      this.map.moveCamera({
      target: {lat:geoPosition.coords.latitude, lng: geoPosition.coords.longitude},
      zoom: 11,
      tilt: 30,
    }).then(() => {}); 

  });

  this.gpsService.getGpsCoords$().pipe(skip(1)).subscribe(geoPosition => {
    this.marker.setPosition({'lat': geoPosition.coords.latitude, 'lng': geoPosition.coords.longitude })
  })


}

  
  loadMap() {
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCnpxUKLVpYuLOXAtm_nYeKvNsVH3vgDNk',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCnpxUKLVpYuLOXAtm_nYeKvNsVH3vgDNk'
    });


    this.map = GoogleMaps.create('map_canvas');


  }

}
