import { Injectable } from '@angular/core';
import * as Loki from 'lokijs';
import * as LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';
import { promise } from 'protractor';

@Injectable({providedIn: 'root'})
export class LocalDbService {
 private db: Loki;
 private restaurants: any;
 private items: any;
 private testSeralizedJSON = {"filename":"localData.db","collections":[{"name":"restaurants","data":[{"test":"data","meta":{"revision":0,"created":1547349209231,"version":0},"$loki":1},{"test":"data","meta":{"revision":0,"created":1547349357547,"version":0},"$loki":2}],"idIndex":[1,2],"binaryIndices":{},"constraints":null,"uniqueNames":[],"transforms":{},"objType":"restaurants","dirty":true,"cachedIndex":null,"cachedBinaryIndex":null,"cachedData":null,"adaptiveBinaryIndices":true,"transactional":false,"cloneObjects":false,"cloneMethod":"parse-stringify","asyncListeners":false,"disableMeta":false,"disableChangesApi":true,"disableDeltaChangesApi":true,"autoupdate":false,"serializableIndices":true,"ttl":null,"maxId":2,"DynamicViews":[],"events":{"insert":[],"update":[],"pre-insert":[],"pre-update":[],"close":[],"flushbuffer":[],"error":[],"delete":[null],"warning":[null]},"changes":[]},{"name":"items","data":[{"test":"data","meta":{"revision":0,"created":1547349209231,"version":0},"$loki":1},{"test":"data","meta":{"revision":0,"created":1547349357547,"version":0},"$loki":2}],"idIndex":[1,2],"binaryIndices":{},"constraints":null,"uniqueNames":[],"transforms":{},"objType":"items","dirty":true,"cachedIndex":null,"cachedBinaryIndex":null,"cachedData":null,"adaptiveBinaryIndices":true,"transactional":false,"cloneObjects":false,"cloneMethod":"parse-stringify","asyncListeners":false,"disableMeta":false,"disableChangesApi":true,"disableDeltaChangesApi":true,"autoupdate":false,"serializableIndices":true,"ttl":null,"maxId":2,"DynamicViews":[],"events":{"insert":[],"update":[],"pre-insert":[],"pre-update":[],"close":[],"flushbuffer":[],"error":[],"delete":[null],"warning":[null]},"changes":[]}],"databaseVersion":1.5,"engineVersion":1.5,"autosave":true,"autosaveInterval":4000,"autosaveHandle":null,"throttledSaves":true,"options":{"autosave":true,"autoload":true,"autosaveInterval":4000,"adapter":null,"serializationMethod":"normal","destructureDelimiter":"$<\n","recursiveWait":true,"recursiveWaitLimit":false,"recursiveWaitLimitDuration":2000,"started":1547349357490},"persistenceMethod":"adapter","persistenceAdapter":null,"verbose":false,"events":{"init":[null],"loaded":[],"flushChanges":[],"close":[],"changes":[],"warning":[]},"ENV":"BROWSER"};
  constructor() {
  }

  private loadCollections() {
    return new Promise((resolve, reject) => {
      this.restaurants =  this.db.getCollection('restaurants');
      this.items = this.db.getCollection('items');
      resolve();
    });
}

  private loadHandler() {

    // if database did not exist it will be empty so I will intitialize here
      this.loadCollections().then(() => {
        if (this.items === null || this.restaurants === null) {

          console.log('collections null, grabbing from the server');
          this.db.loadJSONObject(this.testSeralizedJSON);
    
            // set it again
            this.restaurants = this.db.getCollection('restaurants');
            this.items = this.db.getCollection('items');
            this.db.saveDatabase();

            if (this.items === null || this.restaurants === null) {
              console.log('db seralized loading error');
            }

      }
      else {
        // success restaurants and items are loaded
        console.log('restaurants and items are loaded!')
      }
      }, (err) => {
        console.log('rejected');
      });
  }

  loadDB() {
    const promise = new Promise((resolve, reject) => {
      const adapter = new LokiIndexedAdapter();
      this.db = new Loki('localData.db', {
        autosave: true,
        autoload: true,
        autosaveInterval: 4 * 1000,
        adapter: adapter
      });

      
      this.db.loadDatabase({}, (err) => {
        if (err) {
          console.log("error");
        }
        else {
        this.loadHandler();
        resolve();
        }
      });
      
    });
    return promise;

  }


}