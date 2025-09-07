import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

// Services
import { GeneralOccurrenceService } from '../../../services/general-occurrence.service';
import { CityService } from '../../../services/city.service';
import { RequestingUnitService } from '../../../services/requesting-unit.service';
import { ProcedureService } from '../../../services/procedure.service';
import { UserService } from '../../../services/user.service';
import { OccurrenceClassificationService } from '../../../services/occurrence-classification.service';
import { AuthorityService } from '../../../services/authority.services';
import { ForensicService } from '../../../services/forensic-services.service';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExamTypeService } from '../../../services/exam-type.service';

@Component({
  selector: 'app-general-occurrence-form',
  standalone: true,
  providers: [provideNativeDateAdapter(), DatePipe],
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule, MatSelectModule, MatDatepickerModule,MatTooltipModule,
  ],
  templateUrl: './general-occurrence-form.component.html',
  styleUrls: ['./general-occurrence-form.component.scss']
})
export class GeneralOccurrenceFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  occurrenceId: string | null = null;
  isLoading = true;
  isSaving = false;
  pageTitle = 'Nova Ocorrência';
  canDeleteAdditionalFields = false;

  // Arrays para dropdowns
  cities: any[] = [];
  authorities: any[] = [];
  requestingUnits: any[] = [];
  procedures: any[] = [];
  experts: any[] = [];
  forensicServices: any[] = [];
  occurrenceClassifications: any[] = [];
  examTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private occurrenceService: GeneralOccurrenceService,
    private cityService: CityService,
    private authorityService: AuthorityService,
    private requestingUnitService: RequestingUnitService,
    private procedureService: ProcedureService,
    private userService: UserService,
    private classificationService: OccurrenceClassificationService,
    private forensicService: ForensicService,
    private examTypeService: ExamTypeService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userRole = this.authService.getUserRole();
    this.canDeleteAdditionalFields = userRole === 'super_admin';
    // ✅ CORREÇÃO: Verificar o modo de edição ANTES de inicializar o formulário.
    this.checkEditMode();
    this.initializeForm();
    this.loadDropdownData();
  }

  get additionalFields(): FormArray {
    return this.form.get('additionalFields') as FormArray;
  }

  private initializeForm(): void {
    // Define os valores iniciais apenas para um novo registro.
    let initialDate: Date | null = new Date();
    let initialTime: string | null = this.datePipe.transform(initialDate, 'HH:mm');

    // Se estiver em modo de edição, os campos de data e hora começam vazios.
    if (this.isEditMode) {
      initialDate = null;
      initialTime = null;
    }

    this.form = this.fb.group({
      // ✅ CORREÇÃO: Desativa os campos de data e hora se estiver em modo de edição.
      occurrenceDate: [{ value: initialDate, disabled: this.isEditMode }, Validators.required],
      occurrenceTime: [{ value: initialTime, disabled: this.isEditMode }, [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      history: ['', [Validators.required, Validators.minLength(10)]],
      procedureId: [null],
      procedureNumber: [''],
      cityId: ['', Validators.required],
      requestingAuthorityId: [null],
      requestingUnitId: [null],
      responsibleExpertId: [null],
      forensicServiceId: ['', Validators.required],
      occurrenceClassificationId: ['', Validators.required],
      examTypeIds: [[]],
      additionalFields: this.fb.array([])
    });
  }

  private checkEditMode(): void {
    this.occurrenceId = this.route.snapshot.paramMap.get('id');
    if (this.occurrenceId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Ocorrência';
    }
  }

  private loadDropdownData(): void {
    this.isLoading = true;

    const dataRequests = {
      cities: this.cityService.getCities().pipe(catchError(() => of([]))),
      authorities: this.authorityService.getAuthorities().pipe(catchError(() => of([]))),
      requestingUnits: this.requestingUnitService.getRequestingUnits(1, 1000, '').pipe(catchError(() => of({ data: [] }))),
      procedures: this.procedureService.getProcedures().pipe(catchError(() => of([]))),
      classifications: this.classificationService.getClassifications(1, 1000, '', '').pipe(catchError(() => of({ data: [] }))),
      forensicServices: this.forensicService.getForensicServices(1, 1000, '').pipe(catchError(() => of({ data: [] }))),
      experts: this.userService.getUsers(1, 1000, 'active', '', 'perito_oficial').pipe(catchError(() => of({ data: [] }))),
      examTypes: this.examTypeService.getExamTypes(1, 1000, '').pipe(catchError(() => of({ data: [] }))),
    };

    forkJoin(dataRequests).subscribe({
      next: (responses) => {
        this.cities = Array.isArray(responses.cities) ? responses.cities : [];
        this.authorities = Array.isArray(responses.authorities) ? responses.authorities : [];
        this.procedures = Array.isArray(responses.procedures) ? responses.procedures : [];
        this.requestingUnits = responses.requestingUnits?.data || [];
        this.experts = responses.experts?.data || [];
        this.occurrenceClassifications = responses.classifications?.data || [];
        this.forensicServices = responses.forensicServices?.data || [];
        console.log('ExamTypes Response:', responses.examTypes); // DEBUG
        this.examTypes = responses.examTypes?.data || [];
        console.log('ExamTypes Final:', this.examTypes); // DEBUG

        if (this.isEditMode && this.occurrenceId) {
          this.loadOccurrenceData(this.occurrenceId);
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar dados do formulário.', 'Fechar', { duration: 5000 });
      }
    });
  }

  private loadOccurrenceData(id: string): void {
    this.occurrenceService.getOccurrence(id).subscribe({
      next: (occurrence) => {
        try {
          const occurrenceDateTime = new Date(occurrence.occurrenceDate);

          // O patchValue funciona mesmo em campos desativados.
          this.form.patchValue({
            history: occurrence.history,
            procedureNumber: occurrence.procedureNumber,
            procedureId: occurrence.procedure?.id || null,
            cityId: occurrence.city?.id || null,
            requestingAuthorityId: occurrence.requestingAuthority?.id || null,
            requestingUnitId: occurrence.requestingUnit?.id || null,
            responsibleExpertId: occurrence.responsibleExpert?.id || null,
            forensicServiceId: occurrence.forensicService?.id || null,
            occurrenceClassificationId: occurrence.occurrenceClassification?.id || null,
            occurrenceDate: occurrenceDateTime,
            occurrenceTime: this.datePipe.transform(occurrenceDateTime, 'HH:mm'),
            examTypeIds: occurrence.examTypes?.map((et: any) => et.id) || [],
          });

          let additionalFieldsData = occurrence.additionalFields;
          if (typeof additionalFieldsData === 'string') {
            try {
              additionalFieldsData = JSON.parse(additionalFieldsData);
            } catch (e) {
              additionalFieldsData = {};
            }
          }

          if (additionalFieldsData && typeof additionalFieldsData === 'object') {
            this.additionalFields.clear();
            Object.entries(additionalFieldsData).forEach(([key, value]) => {
              this.additionalFields.push(this.createAdditionalField(key, String(value)));
            });
          }
        } catch (error) {
          console.error('Erro ao processar dados da ocorrência:', error);
          this.snackBar.open('Falha ao processar dados da ocorrência.', 'Fechar', { duration: 3000 });
        } finally {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Falha ao carregar dados da ocorrência.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private createAdditionalField(key = '', value = ''): FormGroup {
    return this.fb.group({
      key: [key, Validators.required],
      value: [value, Validators.required]
    });
  }

  addAdditionalField(): void {
    this.additionalFields.push(this.createAdditionalField());
  }

  removeAdditionalField(index: number): void {
    this.additionalFields.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    // Usa getRawValue() para incluir os campos desativados (data e hora) no payload.
    const formValues = this.form.getRawValue();

    const occurrenceDate = new Date(formValues.occurrenceDate);
    const [hours, minutes] = formValues.occurrenceTime.split(':');
    occurrenceDate.setHours(parseInt(hours), parseInt(minutes));

    const payload = {
      ...formValues,
      occurrenceDate: occurrenceDate.toISOString(),
      additionalFields: formValues.additionalFields.reduce((acc: any, field: any) => {
        if (field.key) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {})
    };
    delete payload.occurrenceTime;
    if (Object.keys(payload.additionalFields).length === 0) {
      delete payload.additionalFields;
    }

    const action = this.isEditMode
      ? this.occurrenceService.updateOccurrence(this.occurrenceId!, payload)
      : this.occurrenceService.createOccurrence(payload);

    action.subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open(`Ocorrência ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`, 'Fechar', { duration: 3000 });
        this.router.navigate(['/general-occurrences']);
      },
      error: (err: any) => {
        this.isSaving = false;
        this.snackBar.open(err.error?.message || 'Falha ao salvar a ocorrência.', 'Fechar', { duration: 5000 });
      }
    });
  }
}

