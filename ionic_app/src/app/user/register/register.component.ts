import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../api/auth.service';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

  ngOnInit() {
  }

  submitForm() {
    if (this.registerForm.valid) {
      console.log('form submitted', this.registerForm);
      const credentials = {
        email: this.registerForm.get('email').value,
        password: this.registerForm.get('password').value
      };
      const user = this.auth.emailSignUp(credentials.email, credentials.password);
      console.log('valid');
      user.subscribe((data) => console.log(data));
    } else {
      console.log('not valid');
      console.log(this.registerForm);
    }
  }
}

