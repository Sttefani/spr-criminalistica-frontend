import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { ForensicService, ForensicServiceData } from '../../../services/forensic-services.service';

interface ServiceToggleState {
  service: ForensicServiceData;
  isLinked: boolean;
  isLoading: boolean;
}

@Component({
  selector: 'app-manage-user-services',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './manage-user-services.component.html',
  styleUrls: ['./manage-user-services.component.scss']
})
export class ManageUserServicesComponent implements OnInit {

  user: any;
  services: ServiceToggleState[] = [];
  isLoadingServices = true;
  searchServicesControl = new FormControl('');
  filteredServices: ServiceToggleState[] = [];

  constructor(
    public dialogRef: MatDialogRef<ManageUserServicesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private userService: UserService,
    private forensicServices: ForensicService,
    private snackBar: MatSnackBar
  ) {
    this.user = data.user;
  }

  ngOnInit(): void {
    this.loadServicesAndUserData();

    // Filtro de busca dos serviços
    this.searchServicesControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterServices(searchTerm || '');
    });
  }

  private async loadServicesAndUserData(): Promise<void> {
    try {
      // Carregar todos os serviços forenses
      const allServicesResponse: any = await this.forensicServices.getAllForensicServices().toPromise();

      // Ajustar baseado no formato da resposta
      let allServices: ForensicServiceData[] = [];
      if (Array.isArray(allServicesResponse)) {
        allServices = allServicesResponse;
      } else if (allServicesResponse && 'data' in allServicesResponse && Array.isArray(allServicesResponse.data)) {
        allServices = allServicesResponse.data;
      } else {
        console.warn('Formato inesperado da resposta de serviços:', allServicesResponse);
        allServices = [];
      }

      // Carregar serviços do usuário
      const userServicesResponse: any = await this.userService.getUserForensicServices(this.user.id).toPromise();
      const userServices = userServicesResponse?.forensicServices || [];

      // Mapear para o formato de toggle
      this.services = allServices.map((service: ForensicServiceData) => ({
        service,
        isLinked: userServices.some((us: any) => us.id === service.id),
        isLoading: false
      }));

      console.log('Serviços carregados:', this.services.length);

      // Inicializar serviços filtrados
      this.filteredServices = [...this.services];

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.snackBar.open('Erro ao carregar serviços', 'Fechar', { duration: 3000 });
    } finally {
      this.isLoadingServices = false;
    }
  }

  private filterServices(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredServices = [...this.services];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredServices = this.services.filter(serviceState =>
        serviceState.service.name.toLowerCase().includes(term) ||
        serviceState.service.acronym.toLowerCase().includes(term)
      );
    }
  }

  toggleService(serviceState: ServiceToggleState): void {
    if (serviceState.isLoading) return;

    serviceState.isLoading = true;

    if (serviceState.isLinked) {
      // Desvincular
      this.userService.unlinkUserFromForensicService(this.user.id, serviceState.service.id!).subscribe({
        next: () => {
          serviceState.isLinked = false;
          serviceState.isLoading = false;
          this.snackBar.open(
            `${this.user.name} desvinculado de ${serviceState.service.name}`,
            'Fechar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          serviceState.isLoading = false;
          console.error('Erro ao desvincular:', error);
          this.snackBar.open('Erro ao desvincular serviço', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      // Vincular
      this.userService.linkUserToForensicServices(this.user.id, [serviceState.service.id!]).subscribe({
        next: () => {
          serviceState.isLinked = true;
          serviceState.isLoading = false;
          this.snackBar.open(
            `${this.user.name} vinculado a ${serviceState.service.name}`,
            'Fechar',
            { duration: 3000 }
          );
        },
        error: (error) => {
          serviceState.isLoading = false;
          console.error('Erro ao vincular:', error);
          this.snackBar.open('Erro ao vincular serviço', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
