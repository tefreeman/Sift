import { FireStoreDataService } from './../../services/firestore-data.service';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private fireStoreDataService: FireStoreDataService) { }
  user;
  ngOnInit() {
    this.fireStoreDataService.getUser().subscribe((data) => {
      this.user = data;
      console.log(this.user);
    }
      );
  }

}
