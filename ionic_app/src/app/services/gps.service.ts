import { BehaviorSubject, Observable } from 'rxjs';
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn';
import { concatMap, filter, first, map, merge, skip, subscribeOn, tap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { sortedChanges } from '@angular/fire/firestore';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

import { log } from './logger.service';

const R = 6378137;
const PI_360 = Math.PI / 360;

function distance(a, b) {

  const cLat = Math.cos((a.lat + b.lat) * PI_360);
  const dLat = (b.lat - a.lat) * PI_360;
  const dLon = (b.lon - a.lon) * PI_360;

  const f = dLat * dLat + cLat * cLat * dLon * dLon;
  const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));

  return R * c;
}

@Injectable({ providedIn: "root" })
export class GpsService {
  //TODO set var from cloud store config
  private MIN_DIST_TO_GRID_EDGE = 20;

  private $watch: Observable<Geoposition>;
  private $grid;

  private currentGridCoords = {'lat' : null, 'lon': null};

  constructor(private geolocation: Geolocation) {
    this.$watch = this.geolocation.watchPosition();
    
    const $firstGpsObs = this.$watch.pipe(
      first(),
      map(geoPosition => {
        this.currentGridCoords.lat = geoPosition.coords.latitude;
        this.currentGridCoords.lon = geoPosition.coords.longitude;
        return this.transformToUrlKey(geoPosition);
      })
    );

    const $afterFirstGps = this.$watch.pipe(
      skip(1),
      filter(
        geoPosition => this.currentGridCoords.lat
      ),
      filter(
        geoPosition => this.isOutOfGrid(geoPosition)
      ),
      map(geoPosition => {
        this.currentGridCoords.lat = geoPosition.coords.latitude;
        this.currentGridCoords.lon = geoPosition.coords.longitude;
        return this.transformToUrlKey(geoPosition);
      }),
      tap(newKey => {log("key")})
     
    );
    // behaviorSubject used so that every observer has the same value
    this.$grid =  new BehaviorSubject(null).asObservable().pipe(
      merge($firstGpsObs, $afterFirstGps));
  }

  // detect if user has left max grid bounds and fire new value to the this.grid stream
  private isOutOfGrid(geoPosition: Geoposition) {
    try{
      if (distance(this.currentGridCoords,
         {'lat': geoPosition.coords.latitude, 'lon': geoPosition.coords.longitude }) > this.MIN_DIST_TO_GRID_EDGE) {
          return true;
      } else {
        return false;
      }
    } catch(error) {
      log('isOutOfGrid failed: ');
      log(error);
    }
  }
  // Method to transform gps to an url key. 
  private transformToUrlKey(geoPosition: Geoposition): string {
    const factor = 0.25;
    const long  = (Math.round(geoPosition.coords.longitude / factor) * factor).toFixed(2);
    const lat = (Math.round(geoPosition.coords.latitude / factor) * factor).toFixed(2);
    return (
     'long' + long.toString() + 'lat' + lat.toString()
    );
  }

  getGpsCoords$(): Observable<Geoposition> {
    return this.$watch;
  }

  getGridKey$(): Observable<string> {
    return this.$grid;
  }
}
