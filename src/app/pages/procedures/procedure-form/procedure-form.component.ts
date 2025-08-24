import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Nosso Serviço
import { ProcedureService } from '../../../services/procedure.service';

// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-procedure-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './procedure-form.html',
  styleUrls: ['./procedure-form.scss']
})
export class ProcedureFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  procedureId: string | null = null;
  isLoading = true;
  pageTitle = 'Novo Procedimento';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private procedureService: ProcedureService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // ==========================================================
    // A CORREÇÃO É AQUI: O formulário agora corresponde à API
    // ==========================================================
    this.form = this.fb.group({
      name: ['', Validators.required],
      acronym: ['', Validators.required], // 'description' foi trocado por 'acronym'
    });

    this.procedureId = this.route.snapshot.paramMap.get('id');
    if (this.procedureId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Procedimento';
      this.loadProcedureData(this.procedureId);
    } else {
      this.isLoading = false;
    }
  }

  loadProcedureData(id: string): void {
    this.procedureService.getProcedure(id).subscribe({
      next: (procedure) => {
        this.form.patchValue(procedure);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Falha ao carregar procedimento:", err);
        this.snackBar.open('Falha ao carregar dados do procedimento.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const action = this.isEditMode
      ? this.procedureService.updateProcedure(this.procedureId!, this.form.value)
      : this.procedureService.createProcedure(this.form.value);

    action.subscribe({
      next: () => {
        this.snackBar.open('Procedimento salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/procedures']);
      },
      error: (err) => {
        console.error("Falha ao salvar procedimento:", err);
        this.snackBar.open('Falha ao salvar o procedimento.', 'Fechar', { duration: 3000 });
      }
    });
  }
}
