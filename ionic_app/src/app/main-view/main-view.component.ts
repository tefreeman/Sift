import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { GpsService } from '../services/gps.service';
@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

  constructor(private auth: AuthService, private testGps: GpsService) { }

  ngOnInit() {
    this.testGps.getGpsCoords().subscribe((d) => console.log(d));
  }

  testLogout() {
    this.auth.signOut();
  }
}
