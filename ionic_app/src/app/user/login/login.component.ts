import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../api/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService
    ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

  ngOnInit() {
  }

  submitForm() {
    if (this.loginForm.valid) {
    console.log('form submitted', this.loginForm);
    const credentials = {
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value
    };
    const user  = this.auth.emailLogin(credentials.email, credentials.password);
    console.log('valid');
    user.subscribe((data) => console.log(data));
    } else {
      console.log('not valid');
      console.log(this.loginForm);
    }
  }
}
