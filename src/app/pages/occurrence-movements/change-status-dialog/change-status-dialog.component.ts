import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

export interface ChangeStatusDialogData {
  occurrenceId: string;
  caseNumber: string;
  currentStatus: string;
}

@Component({
  selector: 'app-change-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule
  ],
  templateUrl: './change-status-dialog.html',
  styleUrl: './change-status-dialog.scss'
})
export class ChangeStatusDialogComponent {
  statusForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ChangeStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeStatusDialogData
  ) {
    this.statusForm = this.fb.group({
      newStatus: ['CONCLUIDA', [Validators.required]],
      observations: ['']
    });
  }

  onSubmit(): void {
    if (this.statusForm.valid) {
      const result = {
        occurrenceId: this.data.occurrenceId,
        newStatus: this.statusForm.value.newStatus,
        observations: this.statusForm.value.observations?.trim() || null
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'CONCLUIDA': return 'Concluída';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  }
}
