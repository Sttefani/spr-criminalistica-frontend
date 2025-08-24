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

// Serviços e Componentes
import { UserService } from '../../../services/user.service';
import { ApproveUserComponent } from '../../../components/dialogs/approve-user/approve-user.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule, MatDialogModule, MatIconModule
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Escuta por mudanças na paginação ou nos filtros
    merge(this.paginator.page, this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()), this.statusControl.valueChanges)
      .pipe(
        startWith({}),
        // switchMap cancela a requisição anterior se uma nova chegar
        switchMap(() => {
          this.isLoadingResults = true;
          const page = this.paginator.pageIndex + 1;
          const limit = this.paginator.pageSize;
          const search = this.searchControl.value || '';
          const status = this.statusControl.value || 'all';
          // Chama o serviço com os parâmetros atuais
          return this.userService.getUsers(page, limit, status, search).pipe(
            // Em caso de erro, retorna um resultado vazio para não quebrar a aplicação
            catchError(() => of({ data: [], total: 0 }))
          );
        })
      ).subscribe(response => {
        this.isLoadingResults = false;
        this.totalData = response.total;
        this.dataSource.data = response.data;
      });
  }

  // Método para forçar a recarga dos dados
  reloadData(): void {
    // A forma mais simples de disparar o `merge` é emitir um evento no paginator
    this.paginator.page.emit();
  }

  formatUserRole(role: string): string {
    if (!role) return 'Não definido';
    return role.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  // Métodos de ação que chamam a API e recarregam os dados
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
