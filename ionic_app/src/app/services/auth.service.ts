import { DataService } from './data.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap} from 'rxjs/operators';
import { first } from 'rxjs/operators';

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  favoriteColor?: string;
}

interface EmailPasswordCredentials {
  email: string;
  password: string;
}


@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private fsDataService: DataService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {}

  emailSignUp(credentials: EmailPasswordCredentials) {
    return this.afAuth.auth.createUserWithEmailAndPassword(credentials.email,
       credentials.password);
  }

  emailLogin(credentials: EmailPasswordCredentials) {
    return this.afAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password);
  }

  googleLogin() {
    const provider = new auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  FacebookLogin() {
    const provider = new auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  TwitterLogin() {
    const provider = new auth.TwitterAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.fsDataService.updateUserData(credential.user);
      });
  }

  resetPassword(email: string) {
    this.afAuth.auth.sendPasswordResetEmail(email).then()
    .catch((err) => {
      console.log(err);
    });
  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
        this.router.navigate(['/']);
    });
  }

  isLoggedIn() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }
}
