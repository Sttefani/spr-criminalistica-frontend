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
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon'; // ← IMPORT CORRETO

// Serviços
import { OccurrenceClassificationService } from '../../../services/occurrence-classification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-occurrence-classification-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
    MatIconModule // ← CORRIGIDO (era MatIcon)
  ],
  templateUrl: './occurrence-classification-list.html',
  styleUrls: ['./occurrence-classification-list.scss']
})
export class OccurrenceClassificationListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['code', 'name', 'group', 'actions'];
  totalData = 0;
  isLoadingResults = true;
  searchControl = new FormControl('');
  groupControl = new FormControl('all');
  groups: string[] = [];
  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private classificationService: OccurrenceClassificationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isSuperAdmin = this.userRole === 'super_admin';
    this.canCreateOrEdit = this.isSuperAdmin || this.userRole === 'servidor_administrativo';
    this.loadGroups();
  }

  ngAfterViewInit(): void {
    merge(this.paginator.page, this.searchControl.valueChanges.pipe(debounceTime(400)), this.groupControl.valueChanges)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const page = this.paginator.pageIndex + 1;
          const limit = this.paginator.pageSize;
          const search = this.searchControl.value || '';
          const group = this.groupControl.value || 'all';
          return this.classificationService.getClassifications(page, limit, search, group).pipe(
            catchError(() => of({ data: [], total: 0 }))
          );
        })
      ).subscribe(response => {
        this.isLoadingResults = false;
        this.totalData = response.total;
        this.dataSource.data = response.data;
      });
  }

  loadGroups(): void {
    this.classificationService.getAllGroups().subscribe(groups => {
      this.groups = groups;
    });
  }

  reloadData(): void {
    this.paginator.page.emit();
  }

  deleteClassification(id: string, name: string): void {
    if (confirm(`Tem certeza que deseja excluir a classificação "${name}"?`)) {
      this.classificationService.deleteClassification(id).subscribe({
        next: () => {
          this.snackBar.open('Classificação excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.reloadData();
        },
        error: () => {
          this.snackBar.open('Erro ao excluir classificação.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  trackByGroup(index: number, group: string): string {
    return group;
  }
}
