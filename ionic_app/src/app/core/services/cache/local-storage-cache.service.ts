import { from } from 'rxjs';
import { catchError, map, timeInterval } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Platform } from '@ionic/angular';

import { log } from '../../logger.service';

@Injectable({ providedIn: 'root' })
export class LocalStorageCacheService {

    constructor(private nativeStorage: NativeStorage) {

    }

    public store(key: string, obj: any) {
        this.nativeStorage.setItem(key, obj).then(
            () => console.log('stored item!'),
            error => console.log('Error storing item', error)
        );
    }

    public clearAllItems() {
        this.nativeStorage.clear().then(
            () => console.log('stored item!'),
            error => console.log('Error storing item', error)
        );
    }
    public get(key: string, date: number) {
        return from(this.nativeStorage.getItem(key)).pipe(
            catchError((err) => {
                log('error get cache', '', err);
                return null;
            }),
            map((data) => {
                if (this.isExpired(data.lastUpdate, date)) {
                    this.nativeStorage.remove(key);
                    return null;
                } else {
                    return data;
                }
            })
        )

    }

    private isExpired(expireDate: number, currentVerDate: number): boolean {
        if (expireDate !== currentVerDate) {
            return true;
        } else {
            return false;
        }
    }

}

