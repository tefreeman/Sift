import { Injectable } from '@angular/core';
import {File, IWriteOptions} from '@ionic-native/file/ngx';
import { from, Observable, of } from 'rxjs';
import { map, mapTo, filter, concatMap, merge, switchMap} from 'rxjs/operators'
@Injectable({ providedIn: 'root' })
export class RequestFileCacheService {
    private directory;
    constructor(private fileStorage: File) {
        this.directory = fileStorage.dataDirectory;
    }

    cache(fileName: string, obj: any) {
       return from(this.fileStorage.createFile(this.directory, fileName, true));
    }

    clearCachedFile(fileName: string) {
        return from(this.fileStorage.removeFile(this.directory, fileName));
    }

    checkIfFileCached(fileName: string) {
        return from(this.fileStorage.checkFile(this.directory, fileName).then( (val) => {
            return true;
        }, (rejected) => {
            return rejected;
        }));
    }

    removeFile(fileName) {
        return from(this.fileStorage.removeFile(this.directory, fileName));
    }
    readAsText(fileName) {
        return from(this.fileStorage.readAsBinaryString(this.directory, fileName));

    }
    //default overwrites
    writeFile(fileName, data) {
        return from(this.fileStorage.writeFile(this.directory, fileName, data, {'replace': true} ));
    }

}

