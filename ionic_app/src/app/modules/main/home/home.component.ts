import { Component, OnInit } from '@angular/core';
import { DataService } from "../../../core/services/data.service";
import { AuthService } from "../../../core/authentication/auth.service";
@Component({
    selector: 'sg-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    constructor(private userService: AuthService) {
    }

    ngOnInit() {}

    logout(){
        this.userService.signOut();
    }
}
