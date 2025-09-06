import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface AddMovementDialogData {
  occurrenceId: string;
  caseNumber: string;
}

@Component({
  selector: 'app-add-movement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-movement-dialog.html',
  styleUrls: ['./add-movement-dialog.scss']
})
export class AddMovementDialogComponent {
  movementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMovementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddMovementDialogData
  ) {
    this.movementForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.movementForm.valid) {
      const result = {
        occurrenceId: this.data.occurrenceId,
        description: this.movementForm.value.description.trim()
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
