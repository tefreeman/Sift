import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import {ReactiveFormsModule, FormGroup, FormBuilder, Validators} from '@angular/forms';
import { messaging } from 'firebase';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
   /* TODO
   * 1. Create HTML sign-up page
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
   },
   'confirmPassword' : {
     'match': 'Passwords must match'
   }
 };

   constructor(private fb: FormBuilder,
               private auth: AuthService
             ) { }

   ngOnInit() {
     this.buildForm();
   }

   signupWithEmail(): void {
     this.auth.emailSignUp(this.userForm.value);
   }

   loginWithGoogle(): void {
     this.auth.googleLogin();
   }
   loginWithFacebook(): void {
     this.auth.FacebookLogin();
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
     'confirmPassword': ['', []
  ]
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
    if (form.get('password').value !== form.get('confirmPassword').value) {
      this.formErrors['password'] += this.validationMessages['confirmPassword']['match'];
    }
   }

}
