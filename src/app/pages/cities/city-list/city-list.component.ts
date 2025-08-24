import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CityService } from '../../../services/city.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-city-list',
  standalone: true,
  // ==========================================================
  // A CORREÇÃO PRINCIPAL É AQUI: O ARRAY DE IMPORTS
  // ==========================================================
  imports: [
    CommonModule,        // <-- Para *ngIf
    RouterModule,        // <-- Para routerLink
    MatTableModule,      // <-- Para mat-table, *matHeaderCellDef, *matCellDef
    MatButtonModule,     // <-- Para mat-raised-button, mat-icon-button
    MatIconModule,       // <-- Para <mat-icon>
    MatSnackBarModule,
  ],
  templateUrl: './city-list.html',
  styleUrls: ['./city-list.scss']
})
export class CityListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['name', 'state', 'actions'];
  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;

  constructor(
    private cityService: CityService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isSuperAdmin = this.userRole === 'super_admin';
    this.canCreateOrEdit = this.isSuperAdmin || this.userRole === 'servidor_administrativo';
    this.loadCities();
  }

  loadCities(): void {
    this.cityService.getCities().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  deleteCity(id: string, name: string): void {
    if (confirm(`Tem certeza que deseja excluir a cidade "${name}"?`)) {
      this.cityService.deleteCity(id).subscribe({
        next: () => {
          this.snackBar.open('Cidade excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadCities();
        },
        error: (err) => {
          this.snackBar.open('Falha ao excluir a cidade.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
