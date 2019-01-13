import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Observable } from 'rxjs';
import { subscribeOn } from 'rxjs/operators';
import { sortedChanges } from '@angular/fire/firestore';

/**
* Returns the closest number from a sorted array.
**/
function closest(arr: Array<any>, prop: string, target: number): any {
  if (!(arr) || arr.length == 0)
      return null;
  if (arr.length == 1)
      return arr[0];

  for (var i=1; i<arr.length; i++) {
      // As soon as a number bigger than target is found, return the previous or current
      // number depending on which has smaller difference to the target.
      if (arr[i][prop] > target) {
          var p = arr[i-1][prop];
          var c = arr[i][prop]
          return Math.abs( p-target ) < Math.abs( c-target ) ? arr[i-1] : arr[i];
      }
  }
  // No number in array is bigger so return the last.
  return arr[arr.length-1];
}

// calc distance between 2 gps coords
// unit k = km, default is miles
function distance(unit, lat1, lon1, lat2, lon2,) {
if ((lat1 == lat2) && (lon1 == lon2)) {
  return;
}
else {
  let radlat1 = Math.PI * lat1/180;
  let radlat2 = Math.PI * lat2/180;
  let theta = lon1 - lon2;
  let radtheta = Math.PI * theta/180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;
  
  if (unit=="k") { dist = dist * 1.609344 }
  return dist;
}

}
@Injectable({ providedIn: 'root' })
export class GpsService {

//TODO set var from cloud store config
private minEdgeDistance = 15;
private sortedGpsGrid = [
  {'id': 0, 'lat': 2, 'lon': 82},
  {'id': 1, 'lat': 31, 'lon': 85},
  {'id': 0, 'lat': 77, 'lon': 82},
  {'id': 1, 'lat': 74, 'lon': 85},
  {'id': 2, 'lat': 71, 'lon': 87},
];

private watch: Observable<Geoposition>
private gridId: Observable<any>;

    constructor(private geolocation: Geolocation) {
     this.watch = this.geolocation.watchPosition();
     
     this.watch.subscribe((d) => {
      let pt = closest(this.sortedGpsGrid, 'lat', d.coords.latitude);
      console.log(distance('k', d.coords.latitude, d.coords.longitude, pt.lat, pt.lon  ));
     })  }

  getGpsCoords(): Observable<Geoposition> {
    return this.watch;
  }

  getGridId(): Observable<any> {
    return this.gridId;
  }


}

