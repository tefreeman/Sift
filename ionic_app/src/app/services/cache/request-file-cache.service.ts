import { Injectable } from '@angular/core';
import { timeInterval } from 'rxjs/operators';
import {File} from '@ionic-native/file/ngx';

@Injectable({ providedIn: 'root' })
export class RequestFileCacheService {
    constructor(private fileStorage: File) {}

     cache(fileName: string, obj: any) {
        this.fileStorage.createFile(this.fileStorage.cacheDirectory, fileName, true)
         .then(
             () => console.log('success'),
             err => console.log('error ', err)
         );
    }

    async clearCachedFile(fileName: string) {
        this.fileStorage.removeFile(this.fileStorage.cacheDirectory, fileName)
        .then(
            () => console.log('success'),
            err => console.log(err)
        );
    }

    async checkIfFileCached(fileName: string) {
        let result;
        await this.fileStorage.checkFile(this.fileStorage.cacheDirectory, fileName)
        .then(
            () => result = true,
            err => result = false,
        );
        return result;
    }



}

