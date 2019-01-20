import { Component, OnInit } from '@angular/core';

import { AuthService } from '../core/authentication/auth.service';
import { RequestFileCacheService } from '../core/services/cache/request-file-cache.service';
import { GpsService } from '../../core/services/gps.service';
import { LocalDbService } from '../../core/services/local-db.service';
import { log } from '../core/logger.service';

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
  }
  

  // this.requestFileCacheService.removeFile('long-87.50lat33.25').subscribe((e) => console.log(e));
  }

