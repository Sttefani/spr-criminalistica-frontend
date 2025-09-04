import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Nosso Serviço
import { RequestingUnitService } from '../../../services/requesting-unit.service';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-requesting-unit-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './requesting-unit-form.html',
  styleUrls: ['./requesting-unit-form.scss']
})
export class RequestingUnitFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  unitId: string | null = null;
  isLoading = true;
  pageTitle = 'Nova Unidade Demandante';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private requestingUnitService: RequestingUnitService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      acronym: ['', Validators.required],
    });

    this.unitId = this.route.snapshot.paramMap.get('id');
    if (this.unitId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Unidade Demandante';
      this.loadUnitData(this.unitId);
    } else {
      this.isLoading = false;
    }
  }

  loadUnitData(id: string): void {
    this.requestingUnitService.getRequestingUnit(id).subscribe({
      next: (unit) => {
        this.form.patchValue(unit);
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Falha ao carregar dados da unidade.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const action = this.isEditMode
      ? this.requestingUnitService.updateRequestingUnit(this.unitId!, this.form.value)
      : this.requestingUnitService.createRequestingUnit(this.form.value);

    action.subscribe({
      next: () => {
        this.snackBar.open('Unidade salva com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/requesting-units']);
      },
      error: (err) => {
        let errorMessage = 'Falha ao salvar a unidade.';
        if (err.error?.message) {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      }
    });
  }
}
