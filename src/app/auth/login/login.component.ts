import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth.service';

// ==========================================================
// AQUI ESTÁ A CORREÇÃO - O DECORATOR @Component COMPLETO
// ==========================================================
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // O formulário agora usa 'email'
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    // Enviamos o formulário diretamente
    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        let errorMessage = 'E-mail ou senha inválidos.';
        if (err.status !== 401) {
          errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
        }
        this.snackBar.open(errorMessage, 'Fechar', { duration: 3000 });
      }
    });
  }
}
