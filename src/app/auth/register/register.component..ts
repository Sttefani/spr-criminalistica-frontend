import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Imports do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth.service';

// Validador customizado para senhas
export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (matchingControl?.errors && !matchingControl.errors['mustMatch']) {
      return null;
    }

    if (control?.value !== matchingControl?.value) {
      matchingControl?.setErrors({ mustMatch: true });
      return { mustMatch: true };
    } else {
      matchingControl?.setErrors(null);
      return null;
    }
  };
}

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', Validators.required],
      phone: [''],
      institution: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  onSubmit(): void {
  if (this.registerForm.invalid) {
    console.log('Formulário inválido');
    return;
  }

  // ==========================================================
  // 1. FAZEMOS UMA CÓPIA DOS DADOS DO FORMULÁRIO
  // ==========================================================
  const formValues = { ...this.registerForm.value };

  // ==========================================================
  // 2. LIMPAMOS O CPF NESSA CÓPIA, SE ELE EXISTIR
  // .replace(/\D/g, '') remove todos os caracteres que não são números
  // ==========================================================
  if (formValues.cpf) {
    formValues.cpf = formValues.cpf.replace(/\D/g, '');
  }

  // 3. Agora, usamos a cópia limpa para preparar os dados para a API
  const { confirmPassword, ...userData } = formValues;

  // LOGS DE DEBUG
  console.log('=== DEBUG REGISTRO ===');
  console.log('Dados sendo enviados (após limpeza do CPF):', userData); // Log atualizado
  console.log('AuthService:', this.authService);

  this.authService.register(userData).subscribe({
    next: (response: any) => {
      console.log('✅ Sucesso:', response);
      this.snackBar.open('Cadastro solicitado com sucesso! Aguarde a aprovação.', 'Fechar', {
        duration: 5000,
      });
      this.router.navigate(['/login']);
    },
    error: (err: any) => {
      console.error('❌ Erro completo:', err);
      console.error('Status HTTP:', err.status);
      console.error('Mensagem:', err.message);
      console.error('URL que falhou:', err.url);

      let errorMessage = 'Ocorreu um erro ao tentar registrar.';
      if (err.status === 409) {
        errorMessage = 'O e-mail ou CPF informado já está em uso.';
      } else if (err.status === 0) {
        errorMessage = 'Erro de conexão com o servidor.';
      } else if (err.status === 400) {
        errorMessage = 'Dados inválidos enviados.';
      }

      this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
    }
  });
}
}
