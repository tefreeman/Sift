import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import {ReactiveFormsModule, FormGroup, FormBuilder, Validators} from '@angular/forms';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


    /* TODO
   * 1. Create HTML login page
   * 2. Create and integrate CloudStore service
   * 3. Add Google, FaceBook
   * 4. Add Local email and password validators
  */
 userForm: FormGroup;

formErrors = {
  'email': '',
  'password': ''
};

validationMessages = {
  'email': {
    'required':      'Email is required.',
    'email':         'Email must be a valid email'
  },
  'password': {
    'required':      'Password is required.',
    'pattern':       'Password must be include at one letter and one number.',
    'minlength':     'Password must be at least 4 characters long.',
    'maxlength':     'Password cannot be more than 40 characters long.',
  }
};

  constructor(private fb: FormBuilder,
              private auth: AuthService,
              public alertController: AlertController
            ) { }

  ngOnInit() {
    this.buildForm();
  }

  async presentAlertConfirm() {
    // checks to make sure email field is valid
    if (this.userForm.get('email').valid) {
    const alert = await this.alertController.create({
      header: 'Reset Password',
      message: ` reset instructions will be sent to <strong>${this.userForm.value.email}</strong>`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blh) => {
          // do nothing
          }
        }, {
          text: 'Confirm',
          handler: () => {
          this.auth.resetPassword(this.userForm.value.email);
          }
        }
      ]
    });

    await alert.present();
  }
  }

  loginWithEmail(): void {
    this.auth.emailLogin(this.userForm.value);
  }

  testLogin() {
    this.auth.isLoggedIn();
  }

  loginWithGoogle(): void {
    this.auth.googleLogin();
  }
  loginWithFacebook(): void {
    this.auth.FacebookLogin();
  }

  resetPassword() {

  }

  buildForm(): void {
    this.userForm = this.fb.group({
      'email': ['', [
          Validators.required,
          Validators.email
        ]
      ],
      'password': ['', [
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9`!@#$%^&*()\-_\+=|}{:;?/>.<,~\"\']+)$'),
        Validators.minLength(6),
        Validators.maxLength(25)
      ]
    ],
    });

    this.userForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.userForm) { return; }
    const form = this.userForm;
    for (const field of Object.keys(this.formErrors)) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key of Object.keys(control.errors)) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }



}
