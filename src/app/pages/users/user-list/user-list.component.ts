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
import { MatTooltipModule } from '@angular/material/tooltip';

// Serviços e Componentes
import { UserService } from '../../../services/user.service';
import { ApproveUserComponent } from '../../../components/dialogs/approve-user/approve-user.component';
import { ManageUserServicesComponent } from '../../../components/dialogs/manage-user-services/manage-user-services.component';
// ✅ 1. Importar o novo componente de diálogo

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, MatTableModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule, MatDialogModule,
    MatIconModule, MatSlideToggleModule, MatTooltipModule
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['name', 'email', 'cpf', 'institution', 'role', 'status', 'forensicServices', 'actions'];
  totalData = 0;
  isLoadingResults = true;

  searchControl = new FormControl('');
  statusControl = new FormControl('all');
  authorityToggleControl = new FormControl(false);

  private apiUsersResult: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
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
        this.apiUsersResult = response.data;
        this.applyFrontendFilters();
      });

    this.authorityToggleControl.valueChanges.subscribe(() => {
      this.applyFrontendFilters();
    });
  }

  private applyFrontendFilters(): void {
    if (this.authorityToggleControl.value) {
      this.dataSource.data = this.apiUsersResult.filter(user => user.authority !== null && user.authority !== undefined);
    } else {
      this.dataSource.data = this.apiUsersResult;
    }
  }

  reloadData(): void {
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

  // ✅ 2. MÉTODO IMPLEMENTADO
  manageUserServices(user: any): void {
    // Apenas para perfis relevantes
    if (user.role !== 'perito_oficial' && user.role !== 'servidor_administrativo') {
        this.snackBar.open('Esta ação está disponível apenas para Peritos e Servidores Administrativos.', 'Fechar', { duration: 4000 });
        return;
    }

    const dialogRef = this.dialog.open(ManageUserServicesComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { user: user }
    });

    // Recarrega os dados da lista quando o diálogo é fechado com sucesso
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reloadData();
      }
    });
  }

  formatForensicServices(services: any[]): string {
    if (!services || services.length === 0) {
      return 'Nenhum';
    }
    return services.map(service => service.acronym || service.name).join(', ');
  }
}

