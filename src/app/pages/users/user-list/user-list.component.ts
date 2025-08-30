import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { merge, of } from 'rxjs';
import { startWith, switchMap, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Imports do Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Serviços e Componentes
import { UserService } from '../../../services/user.service';
import { ApproveUserComponent } from '../../../components/dialogs/approve-user/approve-user.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, MatTableModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule, MatDialogModule,
    MatIconModule, MatSlideToggleModule
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['name', 'email', 'cpf', 'institution', 'role', 'status', 'actions'];

  totalData = 0;
  isLoadingResults = true;

  // Controles de formulário para os filtros
  searchControl = new FormControl('');
  statusControl = new FormControl('all');
  authorityToggleControl = new FormControl(false); // Propriedade adicionada

  // Armazena a lista vinda da API para filtragem local
  private apiUsersResult: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Escuta mudanças na paginação OU nos filtros de API (busca e status)
    merge(this.paginator.page, this.searchControl.valueChanges.pipe(debounceTime(400)), this.statusControl.valueChanges)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const page = this.paginator.pageIndex + 1;
          const limit = this.paginator.pageSize;
          const search = this.searchControl.value || '';
          const status = this.statusControl.value || 'all';
          return this.userService.getUsers(page, limit, status, search).pipe(
            catchError(() => of({ data: [], total: 0 }))
          );
        })
      ).subscribe(response => {
        this.isLoadingResults = false;
        this.totalData = response.total;
        this.apiUsersResult = response.data; // Armazena o resultado da API
        this.applyFrontendFilters(); // Aplica o filtro de autoridade localmente
      });

    // Escuta APENAS o toggle de autoridade para aplicar o filtro local
    this.authorityToggleControl.valueChanges.subscribe(() => {
      this.applyFrontendFilters();
    });
  }

  // Aplica o filtro de autoridade na lista que já foi carregada
  private applyFrontendFilters(): void {
    if (this.authorityToggleControl.value) {
      this.dataSource.data = this.apiUsersResult.filter(user => user.authority !== null && user.authority !== undefined);
    } else {
      this.dataSource.data = this.apiUsersResult;
    }
  }

  // Recarrega os dados da API
  reloadData(): void {
    // Dispara o evento que o `merge` está escutando para recarregar da API
    this.paginator.page.emit();
  }

  formatUserRole(role: string): string {
    if (!role) return 'Não definido';
    return role.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  approveUser(user: any): void {
    const dialogRef = this.dialog.open(ApproveUserComponent, { width: '400px', data: { userName: user.name } });
    dialogRef.afterClosed().subscribe(selectedRole => {
      if (selectedRole) {
        this.userService.approveUser(user.id, selectedRole).subscribe(() => {
          this.snackBar.open(`Usuário ${user.name} aprovado!`, 'Fechar', { duration: 3000 });
          this.reloadData();
        });
      }
    });
  }

  rejectUser(user: any): void {
    this.userService.rejectUser(user.id).subscribe(() => {
      this.snackBar.open(`Usuário ${user.name} rejeitado.`, 'Fechar', { duration: 3000 });
      this.reloadData();
    });
  }

  toggleUserStatus(user: any, newStatus: 'active' | 'inactive'): void {
    this.userService.updateUserStatus(user.id, newStatus).subscribe(() => {
      this.snackBar.open(`Status de ${user.name} atualizado!`, 'Fechar', { duration: 3000 });
      this.reloadData();
    });
  }
}
