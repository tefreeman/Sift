import { Router } from '@angular/router';
import { AuthService } from './core/authentication/auth.service';
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UnifiedStorageService } from "./core/services/storage/unified-storage.service";
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private auth: AuthService,
        private router: Router,
        private unifiedStorageService: UnifiedStorageService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.redirectUser();
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    async redirectUser() {
        const user = await this.auth.isLoggedIn();
        if (user) {
            this.router.navigate(['/main']);
        } else {
            this.router.navigate(['/start']);
        }
    }
}
