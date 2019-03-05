import { BehaviorSubject, Observable } from 'rxjs';
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn';
import { concatMap, filter, first, map, merge, skip, subscribeOn, tap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { sortedChanges } from '@angular/fire/firestore';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

import { distance } from '../../../shared/functions/helpers.functions';
import { log } from '../../logger.service';

@Injectable({ providedIn: 'root' })
export class GpsService {
  // TODO set var from cloud store config
  private MIN_DIST_TO_GRID_EDGE = 20;

  private $watch: Observable<Geoposition>;
  private $grid;

  private currentGridCoords = { lat: null, lon: null };

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
      filter(geoPosition => this.currentGridCoords.lat),
      filter(geoPosition => this.isOutOfGrid(geoPosition)),
      map(geoPosition => {
        this.currentGridCoords.lat = geoPosition.coords.latitude;
        this.currentGridCoords.lon = geoPosition.coords.longitude;
        return this.transformToUrlKey(geoPosition);
      }),
      tap(newKey => {
        log('key');
      })
    );
    // behaviorSubject used so that every observer has the same value
    this.$grid = new BehaviorSubject(null)
      .asObservable()
      .pipe(merge($firstGpsObs, $afterFirstGps));
  }

  // detect if user has left max grid bounds and fire new value to the this.grid stream
  private isOutOfGrid(geoPosition: Geoposition) {
    try {
      if (
        distance(this.currentGridCoords, {
          lat: geoPosition.coords.latitude,
          lon: geoPosition.coords.longitude
        }) > this.MIN_DIST_TO_GRID_EDGE
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      log('isOutOfGrid failed: ');
      log(error);
    }
  }
  // Method to transform gps to an url key.
  private transformToUrlKey(geoPosition: Geoposition): string {
    const factor = 0.25;
    const long = (
      Math.round(geoPosition.coords.longitude / factor) * factor
    ).toFixed(2);
    const lat = (
      Math.round(geoPosition.coords.latitude / factor) * factor
    ).toFixed(2);
    return 'long' + long.toString() + 'lat' + lat.toString();
  }

  getLiveGpsCoords$(): Observable<Geoposition> {
    return this.$watch;
  }

  /**
   *
   *  getGpsCoordsIfMoved$(distance: number)
   *  returns observable that emits gps pos after moving the provided distance.
   * @param {number} movedDistance - distance in meters;
   * @returns {Observable<Geoposition>}
   * @memberof GpsService
   */
  getGpsCoordsIfMoved$(movedDistance: number): Observable<Geoposition> {
    let last: Geoposition;
    return this.$watch.pipe(
      filter(userPos => {
        if (last === null) {
          last = userPos;
          return true;
        } else {
          if (
            distance(
              { lat: userPos.coords.latitude, lon: userPos.coords.longitude },
              { lat: last.coords.latitude, lon: last.coords.longitude }
            ) > movedDistance
          ) {
            last = userPos;
            return true;
          } else {
            return false;
          }
        }
      })
    );
  }

  getGridKey$(): Observable<string> {
    return this.$grid;
  }
}
