import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Nossos Serviços

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthorityService } from '../../../services/authority.services';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-authority-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatProgressSpinnerModule
  ],
  templateUrl: './authority-form.html',
  styleUrls: ['./authority-form.scss']
})
export class AuthorityFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  authorityId: string | null = null;
  isLoading = true;
  pageTitle = 'Nova Autoridade';
  users: any[] = []; // Para o menu suspenso de usuários

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authorityService: AuthorityService,
    private userService: UserService, // Para buscar a lista de usuários
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      title: ['', Validators.required],
      userId: [null] // Campo opcional para o ID do usuário
    });

    this.loadAllUsers(); // Carrega os usuários para o menu suspenso

    this.authorityId = this.route.snapshot.paramMap.get('id');
    if (this.authorityId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Autoridade';
      this.loadAuthorityData(this.authorityId);
    } else {
      this.isLoading = false;
    }
  }

  loadAllUsers(): void {
  // MUDANÇA: Chama o novo método que não precisa de parâmetros
  this.userService.getAllUsers().subscribe(response => {
    this.users = response.data;
  });
}

  loadAuthorityData(id: string): void {
    this.authorityService.getAuthority(id).subscribe(authority => {
      // patchValue preenche o formulário com os dados da autoridade
      this.form.patchValue({
        name: authority.name,
        title: authority.title,
        userId: authority.user ? authority.user.id : null // Pega o ID do usuário, se existir
      });
      this.isLoading = false;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const action = this.isEditMode
      ? this.authorityService.updateAuthority(this.authorityId!, this.form.value)
      : this.authorityService.createAuthority(this.form.value);

    action.subscribe({
      next: () => {
        this.snackBar.open(`Autoridade salva com sucesso!`, 'Fechar', { duration: 3000 });
        this.router.navigate(['/authorities']);
      },
      error: (err) => {
        this.snackBar.open('Falha ao salvar a autoridade.', 'Fechar', { duration: 3000 });
        console.error(err);
      }
    });
  }
}
