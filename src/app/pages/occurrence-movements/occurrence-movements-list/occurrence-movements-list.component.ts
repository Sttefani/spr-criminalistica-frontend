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
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExtendDeadlineDialogComponent } from '../extend-deadline-dialog/extend-deadline-dialog';
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
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
    MatProgressSpinnerModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatPaginatorModule
],
  templateUrl: './occurrence-movements-list.html',
  styleUrls: ['./occurrence-movements-list.scss']
})
export class OccurrenceMovementsListComponent implements OnInit {
  displayedColumns: string[] = [
    'caseNumber', 'forensicService', 'responsibleExpert', 'deadline', 'status', 'actions'
  ];
  searchTerm: string = '';
  occurrences: any[] = [];           // Esta é a que a tabela usa
  filteredOccurrences: any[] = [];
  isLoading = true;
  userRole: string | null = null;
  canAddMovement = false;
  isSuperAdmin = false;

  // Propriedades de paginação - ADICIONE ESTAS
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  isLoadingMore = false;

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

  this.movementsService.getOccurrencesWithDeadlineStatus(
    this.currentPage,
    this.pageSize,
    this.searchTerm
  ).subscribe({
    next: (response: any) => {
      console.log('=== RESPOSTA PAGINADA ===');
      console.log('Dados:', response.data);
      console.log('Paginação:', response.pagination);

      // Atualizar dados
      this.occurrences = response.data || [];
      this.filteredOccurrences = [...this.occurrences];

      // Atualizar metadados de paginação
      this.totalItems = response.pagination?.total || 0;
      this.totalPages = response.pagination?.totalPages || 0;
      this.currentPage = response.pagination?.page || 1;

      this.isLoading = false;
    },
    error: (error: any) => {
      console.log('Erro:', error.status, error.message);
      this.isLoading = false;
    }
  });
}
  filterOccurrences(): void {
  // Aplicar trim no termo de busca
  const searchTerm = this.searchTerm.trim();

  if (!searchTerm) {
    this.occurrences = [...this.filteredOccurrences];
  } else {
    const term = searchTerm.toLowerCase();
    this.occurrences = this.filteredOccurrences.filter(occurrence => {
      const searchableText = [
        occurrence.caseNumber,
        occurrence.case_number,
        occurrence.id,
        occurrence.responsibleExpert?.name,
        occurrence.forensicService?.name
      ].filter(Boolean)
       .join(' ')
       .toLowerCase()
       .trim(); // Trim também no texto dos dados

      return searchableText.includes(term);
    });
  }
}
clearSearch(): void {
  this.searchTerm = '';
  this.filterOccurrences();
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
  canExtendDeadline(occurrence: any): boolean {
  // Super admin e servidor administrativo podem prorrogar qualquer ocorrência
  if (this.userRole === 'super_admin' || this.userRole === 'servidor_administrativo') {
    return true;
  }

  // Perito oficial só pode prorrogar ocorrências atribuídas a ele
  if (this.userRole === 'perito_oficial') {
    const currentUserId = this.authService.getUserId();
    return occurrence.responsibleExpert?.id === currentUserId;
  }

  return false;
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
  const dialogRef = this.dialog.open(ExtendDeadlineDialogComponent, {
    width: '500px',
    data: {
      occurrenceId: occurrence.id,
      caseNumber: occurrence.caseNumber,
      currentDeadline: occurrence.deadline
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.movementsService.extendDeadline(
        occurrence.id,
        {
          extensionDays: result.extensionDays,
          justification: result.justification
        }
      ).subscribe({
        next: (response) => {
          this.snackBar.open(
            `Prazo prorrogado por ${result.extensionDays} dias!`,
            'Fechar',
            { duration: 3000 }
          );
          this.loadOccurrences();
        },
        error: (error) => {
          console.error('Erro ao prorrogar prazo:', error);
          this.snackBar.open('Erro ao prorrogar prazo', 'Fechar', { duration: 3000 });
        }
      });
    }
  });
}

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
  onPaste(event: any): void {
  // Aguarda o paste ser processado antes de fazer trim
  setTimeout(() => {
    this.searchTerm = this.searchTerm.trim();
    this.filterOccurrences();
  }, 0);
}
// MÉTODOS DE PAGINAÇÃO - ADICIONE ESTES AQUI
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOccurrences();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1; // Volta para primeira página
    this.loadOccurrences();
  }

  onPageEvent(event: PageEvent): void {
  this.currentPage = event.pageIndex + 1; // PageIndex começa em 0
  this.pageSize = event.pageSize;
  this.loadOccurrences();
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
