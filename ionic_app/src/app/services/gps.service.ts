import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Observable } from 'rxjs';
import { subscribeOn, concatMap, first, map, filter, skip } from 'rxjs/operators';
import { sortedChanges } from '@angular/fire/firestore';
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn';
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
private CONFIG_distanceToChangeGridKM = 20;

private sortedGpsGrid = [
  { 'lat': 2, 'lon': 82, subCoords: [
    {'id': 0, 'lat': 3, 'lon': 83,},
    {'id': 0, 'lat': 4, 'lon': 84,},
    {'id': 0, 'lat': 4.2, 'lon': 85,},
    {'id': 0, 'lat': 5, 'lon': 86,},
    {'id': 0, 'lat': 6, 'lon': 87,},
  
  ]},
  { 'lat': 33, 'lon': -83, subCoords: [
    {'id': 0, 'lat': 3, 'lon': 83,},
    {'id': 0, 'lat': 4, 'lon': 84,},
    {'id': 0, 'lat': 4.2, 'lon': 85,},
    {'id': 0, 'lat': 5, 'lon': 86,},
    {'id': 0, 'lat': 6, 'lon': 87,},
  
  ]}
];

private watch: Observable<Geoposition>
private gridId: Observable<any>;
private currentGrid;

    constructor(private geolocation: Geolocation) {
     this.watch = this.geolocation.watchPosition();
     
     const firstGpsObs = this.watch.pipe(
     first(),
     map( (userPos) => {
      const outerSearch = closest(this.sortedGpsGrid, 'lat', userPos.coords.latitude).subCoords;
      let closestDist = 999999;
      let closestGrid;
      for (let i = 0 ; i < outerSearch.length; i++) {
        let dist  = distance('k', userPos.coords.latitude, userPos.coords.longitude, outerSearch[i].lat, outerSearch[i].lon)
        if (dist < closestDist) {
          closestDist = dist;
          closestGrid = outerSearch[i]
        }
      }
      this.currentGrid = closestGrid;
      return closestGrid.id;
     })
     )

     const afterFirstGpsObs = this.watch.pipe(
      skip(1),
      filter( (userPos) => distance('k', userPos.coords.latitude,
       userPos.coords.longitude, this.currentGrid.lat, this.currentGrid.lon ) > this.CONFIG_distanceToChangeGridKM),
      map( (userPos) => {
       const outerSearch = closest(this.sortedGpsGrid, 'lat', userPos.coords.latitude).subCoords;
       let closestDist = 999999;
       let closestGrid;
       for (let i = 0 ; i < outerSearch.length; i++) {
         let dist  = distance('k', userPos.coords.latitude, userPos.coords.longitude, outerSearch[i].lat, outerSearch[i].lon)
         if (dist < closestDist) {
           closestDist = dist;
           closestGrid = outerSearch[i]
         }
       }
       this.currentGrid = closestGrid;
       return closestGrid.id;
      })
      )
 

    }

  getGpsCoords(): Observable<Geoposition> {
    return this.watch;
  }

  getGridId(): Observable<number> {
    return this.gridId;
  }


}

