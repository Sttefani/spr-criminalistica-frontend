import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

// Services
import { ForensicService } from '../../../services/forensic-services.service';

@Component({
  selector: 'app-forensic-services-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './forensic-services-form.html',
  styleUrls: ['./forensic-services-form.scss']
})
export class ForensicServicesFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  serviceId: string | null = null;
  isLoading = false;
  isSaving = false;
  pageTitle = 'Novo Serviço Pericial';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private forensicService: ForensicService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
    this.loadServiceData();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      acronym: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]]
    });
  }

  private checkEditMode(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    if (this.serviceId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Serviço Pericial';
    }
  }

  private loadServiceData(): void {
    if (this.isEditMode && this.serviceId) {
      this.isLoading = true;
      this.forensicService.getForensicService(this.serviceId).subscribe({
        next: (service) => {
          this.form.patchValue({
            name: service.name,
            acronym: service.acronym
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar serviço pericial:', error);
          this.snackBar.open('Erro ao carregar dados do serviço', 'Fechar', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/forensic-services']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formData = this.form.value;

    const action = this.isEditMode
      ? this.forensicService.updateForensicService(this.serviceId!, formData)
      : this.forensicService.createForensicService(formData);

    action.subscribe({
      next: () => {
        this.isSaving = false;
        const message = this.isEditMode ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!';
        this.snackBar.open(message, 'Fechar', { duration: 3000 });
        this.router.navigate(['/forensic-services']);
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Erro ao salvar serviço pericial:', error);
        let errorMessage = 'Erro ao salvar serviço pericial';

        if (error.error?.message?.includes('já existe')) {
          errorMessage = 'Um serviço com este nome ou sigla já existe';
        }

        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      }
    });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  // Getters para facilitar validação no template
  get name() { return this.form.get('name'); }
  get acronym() { return this.form.get('acronym'); }
}
