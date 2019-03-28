import { GpsService } from "../../../../core/services/location/gps.service";
import { first, skip } from "rxjs/operators";

import { Component, OnInit } from "@angular/core";
import { Environment, GoogleMap, GoogleMaps, Marker } from "@ionic-native/google-maps/ngx";
import { Platform } from "@ionic/angular";
import { RestaurantsListService } from "../../../../core/services/data/items/restaurants-list.service";


@Component({
   selector: "sg-home-maps",
   templateUrl: "./maps.component.html",
   styleUrls: ["./maps.component.scss"]
})
export class MapsComponent implements OnInit {
   map: GoogleMap;
   restaurantMarkers: Marker[] = [];
   userMarker: Marker;

   constructor(private platform: Platform, private gpsService: GpsService, private restaurantListService: RestaurantsListService) {
   }

   loadMap() {
      Environment.setEnv({
         API_KEY_FOR_BROWSER_RELEASE: "AIzaSyCnpxUKLVpYuLOXAtm_nYeKvNsVH3vgDNk",
         API_KEY_FOR_BROWSER_DEBUG: "AIzaSyCnpxUKLVpYuLOXAtm_nYeKvNsVH3vgDNk"
      });

      this.map = GoogleMaps.create("map_canvas");
   }

   async ngOnInit() {
      await this.platform.ready();
      await this.loadMap();

      this.gpsService
         .getLiveGpsCoords$()
         .pipe(first())
         .subscribe(geoPosition => {
            this.userMarker = this.map.addMarkerSync({
               title: "You",
               icon: "blue",
               animation: "BOUNCE",
               position: {
                  lat: geoPosition.coords.latitude,
                  lng: geoPosition.coords.longitude
               }
            });
            this.map
               .moveCamera({
                  target: {
                     lat: geoPosition.coords.latitude,
                     lng: geoPosition.coords.longitude
                  },
                  zoom: 12,
                  tilt: 30
               })
               .then(() => {
               });
         });
      this.gpsService
         .getLiveGpsCoords$()
         .pipe(skip(1))
         .subscribe(geoPosition => {
            this.userMarker.setPosition({
               lat: geoPosition.coords.latitude,
               lng: geoPosition.coords.longitude
            });
         });

      this.restaurantListService.GetRestaurants$().subscribe((returnedView) => {
         // view change
         for (const restaurant of this.restaurantMarkers) {
            restaurant.remove();
         }
         this.restaurantMarkers = [];
         for (let i = returnedView.restaurants.length; i--;) {
            this.map.addMarker({
               icon: "red",
               animation: "BOUNCE",
               position: {
                  lat: returnedView.restaurants[i].restaurant.coords.lat,
                  lng: returnedView.restaurants[i].restaurant.coords.lon
               }
            }).then((marker) => {
               this.restaurantMarkers.push(marker);
            });
         }
      });
   }
}
