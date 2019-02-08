import { Component, OnInit } from '@angular/core';

import { log } from '../../../../core/logger.service';
import 'hammerjs';

@Component({
  selector: 'sg-sift-bar',
  templateUrl: './sift-bar.component.html',
  styleUrls: ['./sift-bar.component.scss']
})
export class SiftBarComponent implements OnInit {
  userSifts = ['Weight Loss', 'Fat loss', 'trev custom', 'hardcore diet', 'carb low diet', 'muscle gain max', 'cardio intense'];
  notTapped: boolean = true;

  constructor() {}

  changeStatus() {
    this.notTapped = !this.notTapped;
  }

  ngOnInit() {
  }
}
