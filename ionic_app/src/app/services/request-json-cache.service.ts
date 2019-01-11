import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { timeInterval } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RequestJsonCacheService {
    constructor(private nativeStorage: NativeStorage) {}

     cache(key: string, obj: any, expireDate: number) {
        obj.expireDate = expireDate;
         this.nativeStorage.setItem(key, obj).then(
            () => console.log('stored item!'),
            error => console.log('Error storing item', error)
        );
    }

    async clearAllItems() {
        await this.nativeStorage.clear().then();
        return;
    }
    async getCachedIfExists(key: string) {
        let result;
        await this.nativeStorage.getItem(key)
        .then(
            data => {
                if (this.isExpired(data.expireDate)) {
                    this.nativeStorage.remove(key).then();
                    result = false;
                } else {
                    result = data;
                }
            },
            error => result = false
        );
        return result;
    }

    private isExpired(expireDate: number): boolean {
        const d = new Date();
        if (d.getTime() > expireDate) {
            return true;
        } else {
            return false;
        }
    }

}

