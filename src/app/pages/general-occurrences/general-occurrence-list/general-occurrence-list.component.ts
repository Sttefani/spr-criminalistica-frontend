import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { merge, of } from 'rxjs';
import { startWith, switchMap, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Imports do Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Serviços e Componentes
import { GeneralOccurrenceService, GeneralOccurrence } from '../../../services/general-occurrence.service';
import { AuthService } from '../../../services/auth.service';
import { OccurrenceDetailsDialogComponent } from '../occurrence-details-dialog/occurrence-details-dialog.component';

@Component({
  selector: 'app-general-occurrence-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatTooltipModule, MatDialogModule, TitleCasePipe
  ],
  templateUrl: './general-occurrence-list.html',
  styleUrls: ['./general-occurrence-list.component.scss']
})
export class GeneralOccurrenceListComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<GeneralOccurrence>();
  displayedColumns: string[] = [
    'caseNumber', 'procedure', 'city', 'requestingAuthority', 'responsibleExpert', 'status', 'actions'
  ];

  totalData = 0;
  isLoadingResults = true;
  searchControl = new FormControl('');

  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Handler para o evento de foco para poder ser removido depois
  private focusHandler = () => this.reloadData();

  constructor(
    private occurrenceService: GeneralOccurrenceService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog // A injeção está correta aqui.
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isSuperAdmin = this.userRole === 'super_admin';
    const editingRoles = ['super_admin', 'servidor_administrativo', 'perito_oficial'];
    this.canCreateOrEdit = this.userRole ? editingRoles.includes(this.userRole) : false;
  }

  ngAfterViewInit(): void {
    // Lógica reativa para buscar os dados
    merge(this.paginator.page, this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()))
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const page = this.paginator.pageIndex + 1;
          const limit = this.paginator.pageSize;
          const search = this.searchControl.value || '';
          return this.occurrenceService.getOccurrences(page, limit, search).pipe(
            catchError(() => of({ data: [], total: 0 }))
          );
        })
      ).subscribe(response => {
        this.isLoadingResults = false;
        this.totalData = response.total;
        this.dataSource.data = response.data;
      });

    // Recarrega os dados quando a janela/aba volta a ter foco
    window.addEventListener('focus', this.focusHandler);
  }

  ngOnDestroy(): void {
    // Remove o listener para evitar memory leaks
    window.removeEventListener('focus', this.focusHandler);
  }

  reloadData(): void {
    if (this.paginator) {
      // Emite um evento de página para acionar o 'merge' e recarregar os dados
      this.paginator.page.emit();
    }
  }

  deleteOccurrence(id: string, caseNumber: string | null): void {
    // NOTA: Recomenda-se um diálogo de confirmação (MatDialog) aqui.
    // A função confirm() do browser não é suportada.
    this.occurrenceService.deleteOccurrence(id).subscribe({
      next: () => {
        this.snackBar.open('Ocorrência excluída com sucesso!', 'Fechar', { duration: 3000 });
        this.reloadData();
      },
      error: () => {
        this.snackBar.open('Falha ao excluir a ocorrência.', 'Fechar', { duration: 3000 });
      }
    });
  }

  viewDetails(occurrence: GeneralOccurrence): void {
    this.dialog.open(OccurrenceDetailsDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: occurrence
    });
  }

  trackById(index: number, item: GeneralOccurrence): string {
    return item.id!;
  }
}

