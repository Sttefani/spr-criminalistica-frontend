import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Nosso Serviço
import { ExamTypeService } from '../../../services/exam-type.service';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-exam-type-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './exam-type-form.html',
  styleUrls: ['./exam-type-form.scss']
})
export class ExamTypeFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  examTypeId: string | null = null;
  isLoading = true;
  pageTitle = 'Novo Tipo de Exame';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examTypeService: ExamTypeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      acronym: ['', Validators.required],
      description: [''], // Campo opcional
    });

    this.examTypeId = this.route.snapshot.paramMap.get('id');
    if (this.examTypeId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Tipo de Exame';
      this.loadExamTypeData(this.examTypeId);
    } else {
      this.isLoading = false;
    }
  }

  loadExamTypeData(id: string): void {
    this.examTypeService.getExamType(id).subscribe({
      next: (examType) => {
        this.form.patchValue(examType);
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Falha ao carregar dados do tipo de exame.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const action = this.isEditMode
      ? this.examTypeService.updateExamType(this.examTypeId!, this.form.value)
      : this.examTypeService.createExamType(this.form.value);

    action.subscribe({
      next: () => {
        this.snackBar.open('Tipo de exame salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/exam-types']);
      },
      error: (err) => {
        let errorMessage = 'Falha ao salvar o tipo de exame.';
        if (err.error?.message) {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      }
    });
  }
}
