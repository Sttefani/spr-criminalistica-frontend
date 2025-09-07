import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface ExtendDeadlineDialogData {
  occurrenceId: string;
  caseNumber: string;
  currentDeadline?: Date;
}

@Component({
  selector: 'app-extend-deadline-dialog',
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
  templateUrl: './extend-deadline-dialog.html',
  styleUrl: './extend-deadline-dialog.scss'
})
export class ExtendDeadlineDialogComponent {
  extendForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ExtendDeadlineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExtendDeadlineDialogData
  ) {
    this.extendForm = this.fb.group({
      extensionDays: ['', [Validators.required, Validators.min(1), Validators.max(365)]],
      justification: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  onSubmit(): void {
    if (this.extendForm.valid) {
      this.dialogRef.close(this.extendForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
