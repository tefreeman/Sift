import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/authentication/auth.service';
import { log } from '../../core/logger.service';
import { RequestFileCacheService } from '../../core/services/cache/request-file-cache.service';
import { FiltersService } from '../../core/services/filters.service';
import { GpsService } from '../../core/services/gps.service';
import { LocalDbService } from '../../core/services/local-db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  constructor(private auth: AuthService, private filtersService: FiltersService) { 
    log('homeComponent Constructed', '', {});
  }

  ngOnInit() {
    //this.requestFileCacheService.removeFile('long-87.50lat33.25').subscribe((e) => console.log(e));
  }

  testLogout() {
    this.filtersService.getActiveFilter();
    //this.auth.signOut();
  }
  

  // this.requestFileCacheService.removeFile('long-87.50lat33.25').subscribe((e) => console.log(e));
  }

