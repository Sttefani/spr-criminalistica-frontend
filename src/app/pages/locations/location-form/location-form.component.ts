import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

// Nosso Serviço
import { LocationService } from '../../../services/location.service';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-location-form',
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
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './location-form.html',
  styleUrls: ['./location-form.scss']
})
export class LocationFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  locationId: string | null = null;
  isLoading = true;
  isSaving = false; // NOVO: controla loading do botão
  pageTitle = 'Novo Local/Serviço';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });

    this.locationId = this.route.snapshot.paramMap.get('id');

    if (this.locationId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Local/Serviço';
      this.loadLocationData(this.locationId);
    } else {
      this.isLoading = false;
    }
  }

  loadLocationData(id: string): void {
    this.locationService.getLocation(id).subscribe({
      next: (location) => {
        this.form.patchValue(location);
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Falha ao carregar dados do local.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  // MÉTODO PRINCIPAL CORRIGIDO
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSaving = true; // NOVO: ativa loading

    const action = this.isEditMode
      ? this.locationService.updateLocation(this.locationId!, this.form.value)
      : this.locationService.createLocation(this.form.value);

    action.subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Local salvo com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar'] // NOVO: estilo verde
        });
        this.router.navigate(['/locations']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;

        // DEBUG: Para ver o erro no console
        console.log('Erro completo:', error);
        console.log('Status:', error.status);
        console.log('Error object:', error.error);

        let errorMessage = 'Falha ao salvar';

        // TRATAMENTO ESPECÍFICO PARA ERRO 409 (DUPLICATA)
        if (error.status === 409) {
          if (error.error && error.error.message) {
            errorMessage = error.error.message; // Mensagem do backend
          } else {
            errorMessage = 'Já existe um local com esse nome cadastrado no sistema';
          }
        }
        // Outros erros
        else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar'] // NOVO: estilo vermelho
        });
      }
    });
  }
}
