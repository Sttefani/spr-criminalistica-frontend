import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ProcedureService } from '../../../services/procedure.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-procedure-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule, MatSnackBarModule, MatIconModule],
  templateUrl: './procedure-list.html',
  styleUrls: ['./procedure-list.scss']
})
export class ProcedureListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  // ==========================================================
  // A CORREÇÃO É AQUI: O array de colunas agora corresponde ao HTML
  // ==========================================================
  displayedColumns: string[] = ['name', 'acronym', 'actions'];

  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;

  constructor(
    private procedureService: ProcedureService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isSuperAdmin = this.userRole === 'super_admin';
    this.canCreateOrEdit = this.isSuperAdmin || this.userRole === 'servidor_administrativo';
    this.loadProcedures();
  }

  loadProcedures(): void {
    this.procedureService.getProcedures().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error("Falha ao carregar procedimentos:", err);
        this.snackBar.open('Falha ao carregar a lista de procedimentos.', 'Fechar', { duration: 3000 });
      }
    });
  }

  deleteProcedure(id: string, name: string): void {
    if (confirm(`Tem certeza que deseja excluir o procedimento "${name}"?`)) {
      this.procedureService.deleteProcedure(id).subscribe({
        next: () => {
          this.snackBar.open('Procedimento excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProcedures();
        },
        error: (err) => {
          console.error("Falha ao excluir procedimento:", err);
          this.snackBar.open('Falha ao excluir o procedimento.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
