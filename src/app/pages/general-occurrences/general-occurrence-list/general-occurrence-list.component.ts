import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
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
import { MatSelectModule } from '@angular/material/select'; // Adicionado
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips'; // Adicionado

// Serviços e Componentes
import { GeneralOccurrenceService, GeneralOccurrence } from '../../../services/general-occurrence.service';
import { AuthService } from '../../../services/auth.service';
import { ForensicService, ForensicServiceData } from '../../../services/forensic-services.service'; // Adicionado
import { UserService } from '../../../services/user.service'; // Adicionado
import { OccurrenceDetailsDialogComponent } from '../occurrence-details-dialog/occurrence-details-dialog.component';

@Component({
  selector: 'app-general-occurrence-list',
  standalone: true,
  imports: [
    // Módulos básicos
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    // Módulos do Material
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule, // Adicionado
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule, // Adicionado

    // Pipes
  ],
  templateUrl: './general-occurrence-list.html',
  styleUrls: ['./general-occurrence-list.component.scss']
})
export class GeneralOccurrenceListComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<GeneralOccurrence>();
  displayedColumns: string[] = [
    'caseNumber', 'procedure', 'forensicService', 'city', 'requestingAuthority', 'responsibleExpert', 'status', 'actions'
  ];

  totalData = 0;
  isLoadingResults = true;
  searchControl = new FormControl('');

  // NOVOS CONTROLES E PROPRIEDADES
  serviceFilterControl = new FormControl('all'); // Para o dropdown de serviço
  showMyOccurrencesOnly = false; // Para o botão "Minhas Ocorrências"

  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;

  userForensicServices: ForensicServiceData[] = []; // Para armazenar os serviços do usuário
  isLoadingServices = false; // Para indicar carregamento dos serviços

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Handler para o evento de foco para poder ser removido depois
  private focusHandler = () => this.reloadData();

  constructor(
    private occurrenceService: GeneralOccurrenceService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    // NOVOS SERVIÇOS INJETADOS
    private forensicService: ForensicService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
  console.log('=== COMPONENTE INICIANDO ===');
  this.userRole = this.authService.getUserRole();
  console.log('User role recuperado:', this.userRole);
  this.isSuperAdmin = this.userRole === 'super_admin';
  const editingRoles = ['super_admin', 'servidor_administrativo', 'perito_oficial'];
  this.canCreateOrEdit = this.userRole ? editingRoles.includes(this.userRole) : false;

  console.log('Chamando loadUserForensicServices...');
  // Carregar serviços forenses do usuário
  this.loadUserForensicServices();
}
  ngAfterViewInit(): void {
    // Lógica reativa para buscar os dados incluindo TODOS os filtros
    merge(
      this.paginator.page,
      this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      this.serviceFilterControl.valueChanges // Aciona recarga ao mudar o serviço
      // O filtro showMyOccurrencesOnly será tratado pela chamada direta a reloadData() no toggleMyOccurrences()
    ).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        const page = this.paginator.pageIndex + 1;
        const limit = this.paginator.pageSize;
        const search = this.searchControl.value || '';
        const forensicServiceId: string | undefined =
  this.serviceFilterControl.value === 'all' || this.serviceFilterControl.value === null
    ? undefined
    : this.serviceFilterControl.value;
        const onlyMine = this.showMyOccurrencesOnly; // Pega o estado do botão "Minhas Ocorrências"

        // ATUALIZAÇÃO DA CHAMADA DO SERVIÇO
        return this.occurrenceService.getOccurrences(page, limit, search, forensicServiceId, onlyMine).pipe(
          catchError(() => of({ data: [], total: 0 }))
        );
      })
    ).subscribe(response => {
      this.isLoadingResults = false;
      this.totalData = response.total;
      this.dataSource.data = response.data; // Os filtros agora são aplicados no backend
    });

    window.addEventListener('focus', this.focusHandler);
  }

  ngOnDestroy(): void {
    // Remove o listener para evitar memory leaks
    window.removeEventListener('focus', this.focusHandler);
  }

  private async loadUserForensicServices(): Promise<void> {
    if (!this.userRole || this.userRole === 'super_admin') {
      // Super admin vê todos os serviços
      try {
        this.isLoadingServices = true;
        const response: any = await this.forensicService.getAllForensicServices().toPromise();
        this.userForensicServices = Array.isArray(response) ? response : (response?.data || []);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      } finally {
        this.isLoadingServices = false;
      }
    } else if (this.userRole === 'perito_oficial' || this.userRole === 'servidor_administrativo') {
      // Carregar apenas serviços do usuário
      try {
        this.isLoadingServices = true;
        const userId = this.authService.getUserId();
        if (userId) {
          const response = await this.userService.getUserForensicServices(userId).toPromise();
          this.userForensicServices = response?.forensicServices || [];
        }
      } catch (error) {
        console.error('Erro ao carregar serviços do usuário:', error);
      } finally {
        this.isLoadingServices = false;
      }
    }
  }

  // NOVO MÉTODO: Toggle do filtro "Apenas minhas ocorrências"
  public toggleMyOccurrences(): void {
    this.showMyOccurrencesOnly = !this.showMyOccurrencesOnly;
    this.reloadData(); // Recarrega os dados com o novo estado do filtro
  }

  public reloadData(): void {
    this.isLoadingResults = true;
    const page = this.paginator.pageIndex + 1;
    const limit = this.paginator.pageSize;
    const search = this.searchControl.value || '';
    const forensicServiceId: string | undefined =
      this.serviceFilterControl.value === 'all' || this.serviceFilterControl.value === null
        ? undefined
        : this.serviceFilterControl.value;
    const onlyMine = this.showMyOccurrencesOnly; // Pega o estado do botão "Minhas Ocorrências"

    this.occurrenceService.getOccurrences(page, limit, search, forensicServiceId, onlyMine).pipe(
      catchError(() => of({ data: [], total: 0 }))
    ).subscribe(response => {
      this.isLoadingResults = false;
      this.totalData = response.total;
      this.dataSource.data = response.data;
    });
  }

  deleteOccurrence(id: string, caseNumber: string | null): void {
    // NOTA: Recomenda-se um diálogo de confirmação (MatDialog) aqui.
    this.occurrenceService.deleteOccurrence(id).subscribe({
      next: () => {
        this.snackBar.open('Ocorrência excluída com sucesso!', 'Fechar', { duration: 3000 });
        this.reloadData();
      },
      error: () => {
        this.snackBar.open('Falha ao excluir a ocorrência.', 'Fechar', { duration: 3000 });
      }
    });
  }

  viewDetails(occurrence: GeneralOccurrence): void {
  this.dialog.open(OccurrenceDetailsDialogComponent, {
    width: '95vw',           // ← Era 800px
    maxWidth: '1400px',      // ← Limite máximo
    height: '90vh',          // ← Altura controlada
    maxHeight: '900px',      // ← Limite máximo
    data: occurrence
  });
}

  trackById(index: number, item: GeneralOccurrence): string {
    return item.id!;
  }

  // Utilitários para o template (para os chips de status, se você quiser)
  isPoolCase(occurrence: GeneralOccurrence): boolean {
    return !occurrence.responsibleExpert;
  }

  getServiceBadgeColor(occurrence: GeneralOccurrence): string {
    return this.isPoolCase(occurrence) ? 'accent' : 'primary';
  }

  getServiceBadgeText(occurrence: GeneralOccurrence): string {
    return this.isPoolCase(occurrence) ? 'POOL' : 'ATRIBUÍDO';
  }
}
