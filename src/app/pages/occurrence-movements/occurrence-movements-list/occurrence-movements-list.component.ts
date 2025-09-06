import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OccurrenceMovementsService } from '../../../services/occurrence-movements.service';
import { AuthService } from '../../../services/auth.service';
import { AddMovementDialogComponent } from '../add-movement-dialog/add-movement-dialog.component';
import { ViewMovementsDialogComponent } from '../view-movements-dialog/view-movements-dialog.component';

@Component({
  selector: 'app-occurrence-movements-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './occurrence-movements-list.html',
  styleUrls: ['./occurrence-movements-list.scss']
})
export class OccurrenceMovementsListComponent implements OnInit {
  displayedColumns: string[] = [
    'caseNumber', 'forensicService', 'responsibleExpert', 'deadline', 'status', 'actions'
  ];

  occurrences: any[] = [];
  isLoading = true;
  userRole: string | null = null;
  canAddMovement = false;
  isSuperAdmin = false;

  constructor(
    private movementsService: OccurrenceMovementsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isSuperAdmin = this.userRole === 'super_admin';
    this.canAddMovement = ['super_admin', 'servidor_administrativo', 'perito_oficial'].includes(this.userRole || '');

    this.loadOccurrences();
  }

  loadOccurrences(): void {
    this.isLoading = true;

    this.movementsService.getOccurrencesWithDeadlineStatus().subscribe({
      next: (data: any) => {
        console.log('=== ESTRUTURA REAL DOS DADOS ===');
        console.log('Array completo:', data);

        if (data && data.length > 0) {
          console.log('Primeiro item completo:', data[0]);
          console.log('Campos disponíveis:', Object.keys(data[0]));

          // Verificar estruturas aninhadas
          if (data[0].forensicService) {
            console.log('forensicService:', data[0].forensicService);
            console.log('Campos do forensicService:', Object.keys(data[0].forensicService));
          }

          if (data[0].responsibleExpert) {
            console.log('responsibleExpert:', data[0].responsibleExpert);
          }
        }

        // MOSTRAR OS DADOS MESMO SE DIFERENTES
        this.occurrences = data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.log('Erro:', error.status, error.message);
        this.isLoading = false;
      }
    });
  }

  getDeadlineStatus(occurrence: any): 'overdue' | 'warning' | 'normal' {
    if (occurrence.isOverdue) return 'overdue';
    if (occurrence.isNearDeadline) return 'warning';
    return 'normal';
  }

  getDeadlineIcon(occurrence: any): string {
    const status = this.getDeadlineStatus(occurrence);
    switch (status) {
      case 'overdue': return 'error';
      case 'warning': return 'warning';
      default: return 'schedule';
    }
  }

  getDeadlineColor(occurrence: any): string {
    const status = this.getDeadlineStatus(occurrence);
    switch (status) {
      case 'overdue': return 'warn';
      case 'warning': return 'accent';
      default: return 'primary';
    }
  }

  getDeadlineTooltip(occurrence: any): string {
    if (occurrence.isOverdue) return 'Prazo esgotado!';
    if (occurrence.isNearDeadline) return 'Prazo próximo do vencimento';
    return 'Prazo dentro do normal';
  }

  addMovement(occurrence: any): void {
    const dialogRef = this.dialog.open(AddMovementDialogComponent, {
      width: '500px',
      data: {
        occurrenceId: occurrence.id,
        caseNumber: occurrence.caseNumber
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.movementsService.createMovement(result).subscribe({
          next: (response) => {
            this.snackBar.open('Movimentação adicionada com sucesso!', 'Fechar', { duration: 3000 });
            this.loadOccurrences();
          },
          error: (error) => {
            console.error('Erro ao criar movimentação:', error);
            this.snackBar.open('Erro ao adicionar movimentação', 'Fechar', { duration: 3000 });
          }
        });
      }
    });
  }

viewMovements(occurrence: any): void {
  console.log('Carregando movimentações para:', occurrence.caseNumber);

  this.movementsService.getOccurrenceMovements(occurrence.id).subscribe({
    next: (movements) => {
      console.log('Movimentações encontradas:', movements);

      const dialogRef = this.dialog.open(ViewMovementsDialogComponent, {
        width: '700px',
        maxHeight: '80vh',
        data: {
          caseNumber: occurrence.caseNumber,
          movements: movements,
          userRole: this.userRole,
          isSuperAdmin: this.isSuperAdmin
        }
      });
    },
    error: (error) => {
      console.error('Erro:', error);
      this.snackBar.open('Erro ao carregar movimentações', 'Fechar', { duration: 3000 });
    }
  });
}

  extendDeadline(occurrence: any): void {
    // TODO: Abrir modal para prorrogar prazo
    console.log('Prorrogar prazo de:', occurrence.caseNumber);
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  updateFlags(): void {
    this.movementsService.updateDeadlineFlags().subscribe({
      next: () => {
        this.snackBar.open('Flags de prazo atualizadas!', 'Fechar', { duration: 3000 });
        this.loadOccurrences(); // Recarregar dados
      },
      error: (error) => {
        console.error('Erro ao atualizar flags:', error);
        this.snackBar.open('Erro ao atualizar flags', 'Fechar', { duration: 3000 });
      }
    });
  }
}
