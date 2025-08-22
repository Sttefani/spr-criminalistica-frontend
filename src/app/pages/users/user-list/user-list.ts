import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Imports do Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// Serviços e Componentes
import { UserService } from '../../../services/user.service';
import { ApproveUserComponent } from '../../../components/dialogs/approve-user/approve-user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['name', 'email', 'cpf', 'institution', 'role', 'status', 'actions'];
  currentStatusFilter: string = 'all';

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers(this.currentStatusFilter).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
      },
      error: (err) => {
        if (err.status === 403) {
          this.snackBar.open('Você não tem permissão para acessar este módulo.', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open('Falha ao carregar a lista de usuários.', 'Fechar', { duration: 3000 });
        }
      }
    });
  }

  onFilterChange(status: string): void {
    this.currentStatusFilter = status;
    this.loadUsers();
  }

  formatUserRole(role: string): string {
    if (!role) return 'Não definido';
    return role.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  approveUser(user: any): void {
    const dialogRef = this.dialog.open(ApproveUserComponent, {
      width: '400px',
      data: { userName: user.name }
    });

    dialogRef.afterClosed().subscribe(selectedRole => {
      if (selectedRole) {
        this.userService.approveUser(user.id, selectedRole).subscribe({
          next: () => {
            this.snackBar.open(`Usuário ${user.name} aprovado!`, 'Fechar', { duration: 3000 });
            this.loadUsers();
          },
          error: (err) => {
            if (err.status === 403) {
              this.snackBar.open('Você não tem permissão para essa ação.', 'Fechar', { duration: 3000 });
            } else {
              this.snackBar.open('Falha ao aprovar usuário.', 'Fechar', { duration: 3000 });
            }
          }
        });
      }
    });
  }

  rejectUser(user: any): void {
    this.userService.rejectUser(user.id).subscribe({
      next: () => {
        this.snackBar.open(`Usuário ${user.name} rejeitado.`, 'Fechar', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        if (err.status === 403) {
          this.snackBar.open('Você não tem permissão para essa ação.', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open('Falha ao rejeitar usuário.', 'Fechar', { duration: 3000 });
        }
      }
    });
  }

  toggleUserStatus(user: any, newStatus: 'active' | 'inactive'): void {
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.snackBar.open(`Status de ${user.name} atualizado!`, 'Fechar', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        if (err.status === 403) {
          this.snackBar.open('Você não tem permissão para essa ação.', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open('Falha ao atualizar status.', 'Fechar', { duration: 3000 });
        }
      }
    });
  }
}
