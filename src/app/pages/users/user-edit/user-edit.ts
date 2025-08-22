import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// Enums
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
}

// Interface para o tipo do 'role'
interface RoleOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.scss']
})
export class UserEditComponent implements OnInit {
  editForm!: FormGroup;
  userId: string | null = null;
  isLoading = true;
  userData: any = null;
  isSuperAdmin = false;

  // Enum disponível no template
  UserStatus = UserStatus;

  roles: RoleOption[] = [
    { value: 'perito_oficial', viewValue: 'Perito Oficial' },
    { value: 'delegado', viewValue: 'Delegado' },
    { value: 'oficial_investigador', viewValue: 'Oficial Investigador' },
    { value: 'servidor_administrativo', viewValue: 'Servidor Administrativo' },
    { value: 'usuario_externo', viewValue: 'Usuário Externo' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.initForm();
    this.getUserId();
    if (this.userId) {
      this.loadUserData(this.userId);
    } else {
      this.handleNoUserId();
    }
  }

  private checkUserRole(): void {
    const userRole = this.authService.getUserRole();
    this.isSuperAdmin = userRole === 'super_admin';
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', Validators.required],
      phone: [''],
      institution: [''],
      role: ['', Validators.required],
    });
  }

  private getUserId(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
  }

  private handleNoUserId(): void {
    this.snackBar.open('ID de usuário não encontrado.', 'Fechar', { duration: 3000 });
    this.isLoading = false;
    this.router.navigate(['/users']);
  }

  loadUserData(id: string): void {
    this.userService.findOne(id).subscribe({
      next: (user) => {
        this.userData = user;
        this.editForm.patchValue(user);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário:', err);
        this.snackBar.open('Falha ao carregar dados do usuário.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/users']);
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return;
    }

    if (!this.userId) {
      this.snackBar.open('Erro: ID do usuário não encontrado.', 'Fechar', { duration: 3000 });
      return;
    }

    this.updateUser();
  }

  private updateUser(): void {
    this.isLoading = true;

    this.userService.update(this.userId!, this.editForm.value).subscribe({
      next: () => {
        this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.handleUpdateError(err);
        this.isLoading = false;
      }
    });
  }

  // Método para aprovar usuário
  approveUser(): void {
    if (!this.userId || !this.userData) {
      return;
    }

    const selectedRole = this.editForm.get('role')?.value;
    if (!selectedRole) {
      this.snackBar.open('Selecione um perfil antes de aprovar o usuário.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    this.userService.approveUser(this.userId, selectedRole).subscribe({
      next: () => {
        this.snackBar.open(`Usuário ${this.userData.name} aprovado com sucesso!`, 'Fechar', { duration: 3000 });
        this.router.navigate(['/users']);
      },
      error: (err) => {
        console.error('Erro ao aprovar usuário:', err);
        this.snackBar.open('Falha ao aprovar usuário.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  // Método para rejeitar usuário
  rejectUser(): void {
    if (!this.userId || !this.userData) {
      return;
    }

    if (confirm(`Tem certeza que deseja rejeitar o usuário ${this.userData.name}?`)) {
      this.isLoading = true;

      this.userService.rejectUser(this.userId).subscribe({
        next: () => {
          this.snackBar.open(`Usuário ${this.userData.name} rejeitado.`, 'Fechar', { duration: 3000 });
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error('Erro ao rejeitar usuário:', err);
          this.snackBar.open('Falha ao rejeitar usuário.', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  private handleUpdateError(err: any): void {
    let errorMessage = 'Falha ao atualizar o usuário.';

    if (err.status === 409) {
      errorMessage = 'O e-mail ou CPF informado já está em uso por outro usuário.';
    } else if (err.status === 404) {
      errorMessage = 'Usuário não encontrado.';
    } else if (err.status === 400) {
      errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
    }

    this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos auxiliares para o template
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} é obrigatório`;
    }

    if (field?.hasError('email')) {
      return 'E-mail inválido';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${this.getFieldDisplayName(fieldName)} deve ter pelo menos ${minLength} caracteres`;
    }

    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Nome',
      email: 'E-mail',
      cpf: 'CPF',
      phone: 'Telefone',
      institution: 'Instituição',
      role: 'Perfil'
    };

    return displayNames[fieldName] || fieldName;
  }

  // Métodos auxiliares para verificação de status
  isPending(): boolean {
    return this.userData?.status === UserStatus.PENDING;
  }

  isRejected(): boolean {
    return this.userData?.status === UserStatus.REJECTED;
  }

  isActive(): boolean {
    return this.userData?.status === UserStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.userData?.status === UserStatus.INACTIVE;
  }

  getStatusClass(): string {
    switch (this.userData?.status) {
      case UserStatus.PENDING:
        return 'status-pending';
      case UserStatus.ACTIVE:
        return 'status-active';
      case UserStatus.INACTIVE:
        return 'status-inactive';
      case UserStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusIcon(): string {
    switch (this.userData?.status) {
      case UserStatus.PENDING:
        return 'hourglass_empty';
      case UserStatus.ACTIVE:
        return 'check_circle';
      case UserStatus.INACTIVE:
        return 'pause_circle';
      case UserStatus.REJECTED:
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusText(): string {
    switch (this.userData?.status) {
      case UserStatus.PENDING:
        return 'Pendente de Aprovação';
      case UserStatus.ACTIVE:
        return 'Ativo';
      case UserStatus.INACTIVE:
        return 'Inativo';
      case UserStatus.REJECTED:
        return 'Rejeitado';
      default:
        return 'Status Desconhecido';
    }
  }
}
