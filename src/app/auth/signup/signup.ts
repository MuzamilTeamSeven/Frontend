import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { showSuccess, showError } from '../../shared/utils/alert';
import { AuthService } from '../../services/auth-service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage: string = '';

  roles: string[] = ['CEO', 'CTO', 'PM', 'TeamLead', 'Developer', 'Intern'];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      phonenumber: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
    });
  }

  onSubmit() {
    this.errorMessage = '';
    if (this.signupForm.invalid) return;

    this.isLoading = true;

    this.auth.signup(this.signupForm.value).subscribe({
      next: (res) => {
        showSuccess('Signup successful!');
        this.isLoading = false;
        this.signupForm.reset();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Signup failed!';
        showError(this.errorMessage);
        this.isLoading = false;
      },
    });
  }
}
