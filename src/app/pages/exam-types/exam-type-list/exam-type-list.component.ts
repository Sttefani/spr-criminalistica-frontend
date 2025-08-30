import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

// Serviços e a interface
import { ExamTypeService, ExamType } from '../../../services/exam-type.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-exam-type-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule
  ],
  templateUrl: './exam-type-list.html',
  styleUrls: ['./exam-type-list.scss']
})
export class ExamTypeListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<ExamType>();
  displayedColumns: string[] = ['name', 'acronym', 'description', 'actions'];

  totalData = 0;
  isLoadingResults = true;
  searchControl = new FormControl('');

  // Propriedades para controle de acesso na interface
  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private examTypeService: ExamTypeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isSuperAdmin = this.userRole === 'super_admin';

    // Define quem pode criar/editar: SUPER_ADMIN, SERVIDOR_ADMINISTRATIVO, ou PERITO_OFICIAL
    const editingRoles = ['super_admin', 'servidor_administrativo', 'perito_oficial'];
    this.canCreateOrEdit = this.userRole ? editingRoles.includes(this.userRole) : false;
  }

  ngAfterViewInit(): void {
    // Lógica reativa que busca os dados sempre que a página ou a busca mudam
    merge(this.paginator.page, this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()))
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const page = this.paginator.pageIndex + 1;
          const limit = this.paginator.pageSize;
          const search = this.searchControl.value || '';
          return this.examTypeService.getExamTypes(page, limit, search).pipe(
            catchError(() => of({ data: [], total: 0 }))
          );
        })
      ).subscribe(response => {
        this.isLoadingResults = false;
        this.totalData = response.total;
        this.dataSource.data = response.data;
      });
  }

  // Força a recarga da tabela
  reloadData(): void {
    this.paginator.page.emit();
  }

  // Ação de deletar (disponível apenas para SUPER_ADMIN no template)
  deleteExamType(id: string, name: string): void {
    if (confirm(`Tem certeza que deseja excluir o tipo de exame "${name}"?`)) {
      this.examTypeService.deleteExamType(id).subscribe({
        next: () => {
          this.snackBar.open('Tipo de exame excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.reloadData();
        },
        error: () => {
          this.snackBar.open('Falha ao excluir o tipo de exame.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  // Função trackBy para otimizar a renderização da tabela
  trackByExamType(index: number, item: ExamType): string {
    return item.id!;
  }
}
