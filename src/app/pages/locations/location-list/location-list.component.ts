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

// Serviços e a interface Location
// ==========================================================
// A CORREÇÃO É AQUI: 'servide' virou 'service'
// ==========================================================
import { LocationService, Location } from '../../../services/location.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule
  ],
  templateUrl: './location-list.html',
  styleUrls: ['./location-list.scss']
})
export class LocationListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Location>();
  displayedColumns: string[] = ['name', 'description', 'actions'];

  totalData = 0;
  pageSize = 10;
  isLoadingResults = true;
  searchControl = new FormControl('');

  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private locationService: LocationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isSuperAdmin = this.userRole === 'super_admin';
    this.canCreateOrEdit = this.isSuperAdmin || this.userRole === 'servidor_administrativo';
  }

  ngAfterViewInit(): void {
    merge(this.paginator.page, this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()))
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const page = this.paginator.pageIndex + 1;
          this.pageSize = this.paginator.pageSize;
          const search = this.searchControl.value || '';
          return this.locationService.getLocations(page, this.pageSize, search).pipe(
            catchError(() => of({ data: [], total: 0 }))
          );
        })
      ).subscribe(response => {
        this.isLoadingResults = false;
        this.totalData = response.total;
        this.dataSource.data = response.data;
      });
  }

  trackByLocation(index: number, item: Location): string {
    return item.id!;
  }

  reloadData(): void {
    this.paginator.page.emit();
  }

  deleteLocation(id: string, name: string): void {
    if (confirm(`Tem certeza que deseja excluir o local "${name}"?`)) {
      this.locationService.deleteLocation(id).subscribe({
        next: () => {
          this.snackBar.open('Local excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.reloadData();
        },
        error: () => {
          this.snackBar.open('Falha ao excluir o local.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
