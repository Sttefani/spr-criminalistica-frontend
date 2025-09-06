import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Imports do Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Serviços e a interface
// Serviços
import { ForensicService, ForensicServiceData } from '../../../services/forensic-services.service';
import { AuthService } from '../../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-forensic-service-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatSnackBarModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatTooltipModule, DatePipe,
  ],
  templateUrl: './forensic-services-list.html',
  styleUrls: ['./forensic-services-list.scss']
})
export class ForensicServicesListComponent implements OnInit {
  dataSource = new MatTableDataSource<ForensicServiceData>();
  isLoading = true;

  // Paginação
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Busca
  searchTerm = '';

  // Colunas da tabela
  displayedColumns: string[] = ['name', 'acronym', 'createdAt', 'actions'];

  // Propriedades de permissão
  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;
  deleteForensicServices: any;

  constructor(
    private forensicService: ForensicService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isSuperAdmin = this.userRole?.toLowerCase() === 'super_admin';
    this.canCreateOrEdit = this.isSuperAdmin || this.userRole?.toLowerCase() === 'servidor_administrativo';
    this.loadForensicServices();
  }

  loadForensicServices(): void {
    this.isLoading = true;
    this.forensicService.getForensicServices(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar serviços periciais:', error);
          this.snackBar.open('Erro ao carregar serviços periciais', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadForensicServices();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadForensicServices();
  }

  deleteService(id: string, name: string): void {
    if (confirm(`Tem certeza que deseja excluir o serviço "${name}"?`)) {
      this.forensicService.deleteForensicService(id).subscribe({
        next: () => {
          this.snackBar.open('Serviço pericial excluído com sucesso!', 'Fechar', { duration: 3000 });
          if (this.dataSource.data.length === 1 && this.currentPage > 1) {
            this.currentPage--;
          }
          this.loadForensicServices();
        },
        error: (error: any) => {
          console.error('Erro ao excluir serviço pericial:', error);
          this.snackBar.open('Erro ao excluir serviço pericial', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
