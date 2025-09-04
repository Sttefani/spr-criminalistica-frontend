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
import { RequestingUnitService, RequestingUnit } from '../../../services/requesting-unit.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-requesting-unit-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule
  ],
  templateUrl: './requesting-unit-list.html',
  styleUrls: ['./requesting-unit-list.scss']
})
export class RequestingUnitListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<RequestingUnit>();
  displayedColumns: string[] = ['name', 'acronym', 'actions'];

  totalData = 0;
  isLoadingResults = true;
  searchControl = new FormControl('');

  // Propriedades para controle de acesso na interface
  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private requestingUnitService: RequestingUnitService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    console.log('--- [RequestingUnitList] Verificando Permissões ---');
    console.log('Perfil (role) do usuário obtido do AuthService:', this.userRole);
    this.isSuperAdmin = this.userRole === 'super_admin';
    console.log('A variável "isSuperAdmin" foi definida como:', this.isSuperAdmin);
    this.canCreateOrEdit = this.isSuperAdmin || this.userRole === 'servidor_administrativo';
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
          return this.requestingUnitService.getRequestingUnits(page, limit, search).pipe(
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
  deleteRequestingUnit(id: string, name: string): void {
    if (confirm(`Tem certeza que deseja excluir a unidade "${name}"?`)) {
      this.requestingUnitService.deleteRequestingUnit(id).subscribe({
        next: () => {
          this.snackBar.open('Unidade excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.reloadData();
        },
        error: () => {
          this.snackBar.open('Falha ao excluir a unidade.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  // Função trackBy para otimizar a renderização da tabela
  trackByUnit(index: number, item: RequestingUnit): string {
    return item.id!;
  }
}
