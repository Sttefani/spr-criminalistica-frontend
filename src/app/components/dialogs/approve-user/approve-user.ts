import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Imports do Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-approve-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './approve-user.html',
})
export class ApproveUserComponent {
  form: FormGroup;
  // Lista de perfis disponíveis. Excluímos o super_admin para segurança.
  roles = [
    { value: 'perito_oficial', viewValue: 'Perito Oficial' },
    { value: 'delegado', viewValue: 'Delegado' },
    { value: 'oficial_investigador', viewValue: 'Oficial Investigador' },
    { value: 'servidor_administrativo', viewValue: 'Servidor Administrativo' },
    { value: 'usuario_externo', viewValue: 'Usuário Externo' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ApproveUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userName: string } // Recebe o nome do usuário
  ) {
    this.form = this.fb.group({
      role: ['', Validators.required],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.form.valid) {
      // Retorna o perfil selecionado para o componente que abriu o dialog
      this.dialogRef.close(this.form.value.role);
    }
  }
}
