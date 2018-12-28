import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  constructor() { }
  /* TODO
   * 1. Check internet connection
   * 2. Check if user is registered
   * 3. If a registered Attempt to automatically login
   * 4. If not registered redirect to startScreen
   * 5. If login unsuccessful redirect to startScreen
   * 6. If offline enter offline mode
  */
  ngOnInit() {
  }

}
