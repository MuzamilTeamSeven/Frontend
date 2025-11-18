import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { showSuccess, showError } from '../../shared/utils/alert';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        showSuccess('Welcome back!');
        this.isLoading = false;

        localStorage.setItem('auth_token', res.auth_token);
        localStorage.setItem('user', JSON.stringify(res.data));

        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        showError(err.error?.message || 'Login failed!');
        this.isLoading = false;
      },
    });
  }
}
