import { LocalDbService } from './../services/local-db.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { GpsService } from '../services/gps.service';
@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

  constructor(private auth: AuthService, private localDb: LocalDbService) { }

  ngOnInit() {
    this.localDb.loadDB().then()
  }

  testLogout() {
    this.auth.signOut();
  }
}
