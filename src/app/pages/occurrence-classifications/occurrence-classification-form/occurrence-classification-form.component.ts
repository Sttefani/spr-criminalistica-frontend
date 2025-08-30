import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Nosso Serviço
import { OccurrenceClassificationService } from '../../../services/occurrence-classification.service';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-occurrence-classification-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './occurrence-classification-form.html',
  styleUrls: ['./occurrence-classification-form.scss']
})
export class OccurrenceClassificationFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  classificationId: string | null = null;
  isLoading = true;
  pageTitle = 'Nova Classificação';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private classificationService: OccurrenceClassificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      group: [''], // Campo opcional
    });

    this.classificationId = this.route.snapshot.paramMap.get('id');
    if (this.classificationId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Classificação';
      this.loadClassificationData(this.classificationId);
    } else {
      this.isLoading = false;
    }
  }

  loadClassificationData(id: string): void {
    this.classificationService.getClassification(id).subscribe({
      next: (classification) => {
        this.form.patchValue(classification);
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Falha ao carregar dados da classificação.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const action = this.isEditMode
      ? this.classificationService.updateClassification(this.classificationId!, this.form.value)
      : this.classificationService.createClassification(this.form.value);

    action.subscribe({
      next: () => {
        this.snackBar.open('Classificação salva com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/occurrence-classifications']);
      },
      error: (err) => {
        let errorMessage = 'Falha ao salvar a classificação.';
        if (err.error && typeof err.error.message === 'string') {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      }
    });
  }
}
