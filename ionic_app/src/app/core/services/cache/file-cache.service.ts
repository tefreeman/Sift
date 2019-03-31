import { Injectable } from "@angular/core";
import { File } from "@ionic-native/file/ngx";
import { Platform } from "@ionic/angular";

@Injectable({ providedIn: "root" })
export class FileCacheService {

   private directories: Map<string, string>;

   constructor(private platform: Platform, private file: File) {
   }

   cacheImage(name: string, data){
       this.file.checkDir(this.file.dataDirectory, 'images').then(
          () => {
             //directory exists
             const imageDir = this.file.dataDirectory  + '/images' ;
             this.file.writeFile(imageDir,name,data,{replace: true}).then()
          },
          () => {
             // directory does not exists
             this.file.createDir(this.file.dataDirectory, 'images', false).then( () => {
             const imageDir = this.file.dataDirectory  + '/images' ;
             this.file.writeFile(imageDir,name,data,{replace: true}).then();
             });
          }
       )
   }

   getImage(name: string) {
      this.file.read
   }


}
