import { ProfileFormService } from './../services/profile.form.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-me',
  templateUrl: './me.component.html',
  styleUrls: ['./me.component.scss']
})
export class MeComponent implements OnInit {

  constructor(profileForm: ProfileFormService) { }

  ngOnInit() {
  }

}
