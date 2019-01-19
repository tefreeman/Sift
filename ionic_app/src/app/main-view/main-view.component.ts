import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { RequestFileCacheService } from '../services/cache/request-file-cache.service';
import { GpsService } from '../services/gps.service';
import { LocalDbService } from '../services/local-db.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  
  constructor(private auth: AuthService, private localDb: LocalDbService, private requestFileCacheService: RequestFileCacheService) { 

  }

  ngOnInit() {
    //this.requestFileCacheService.removeFile('long-87.50lat33.25').subscribe((e) => console.log(e));
  }

  testLogout() {
    this.localDb.getCollection$('restaurants').subscribe( (col) => {
      let result = col.find({'name' : 'Isologica'});
      console.log(result);
    }
    )

  // this.requestFileCacheService.removeFile('long-87.50lat33.25').subscribe((e) => console.log(e));
  }
}
