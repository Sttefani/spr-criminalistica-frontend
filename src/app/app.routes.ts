import { Routes } from '@angular/router';

// Componentes Principais
import { LayoutComponent } from './layout/layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component.';

// Componentes das Páginas
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserEditComponent } from './pages/users/user-edit/user-edit.component';
import { AuthorityListComponent } from './pages/authorities/authority-list/authority-list.component';
import { AuthorityFormComponent } from './pages/authorities/authority-form/authority-form.component';
import { CityListComponent } from './pages/cities/city-list/city-list.component';
import { CityFormComponent } from './pages/cities/city-form/city-form.component';
import { ProcedureListComponent } from './pages/procedures/procedure-list/procedure-list.component';
import { ProcedureFormComponent } from './pages/procedures/procedure-form/procedure-form.component';
import { OccurrenceClassificationListComponent } from './pages/occurrence-classifications/occurrence-classification-list/occurrence-classification-list.component';
import { OccurrenceClassificationFormComponent } from './pages/occurrence-classifications/occurrence-classification-form/occurrence-classification-form.component';
import { ExamTypeListComponent } from './pages/exam-types/exam-type-list/exam-type-list.component';
import { ExamTypeFormComponent } from './pages/exam-types/exam-type-form/exam-type-form.component';
// --- NOVAS IMPORTAÇÕES ---
import { RequestingUnitListComponent } from './pages/requesting-units/requesting-unit-list/requesting-unit-list.component';
import { RequestingUnitFormComponent } from './pages/requesting-units/requesting-unit-form/requesting-unit-form.component';

// Guardas de Rota
import { authGuard } from './auth/auth-guard';
import { adminGuard } from './auth/admin-guard';
import { superAdminGuard } from './auth/super-admin-guard';
import { editingAccessGuard } from './auth/editing-access-guard';
import { GeneralOccurrenceListComponent } from './pages/general-occurrences/general-occurrence-list/general-occurrence-list.component';
import { GeneralOccurrenceFormComponent } from './pages/general-occurrences/general-occurrence-form/general-occurrence-form.component';
import { ForensicServicesFormComponent } from './pages/forensic-services/forensic-services-form/forensic-services-form.component';
import { ForensicServicesListComponent } from './pages/forensic-services/forensic-services-list/forensic-services-list.component';
import { OccurrenceMovementsListComponent } from './pages/occurrence-movements/occurrence-movements-list/occurrence-movements-list.component';

export const routes: Routes = [
  // Rotas Públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rotas da Aplicação (Protegidas)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      { path: 'general-occurrences', component: GeneralOccurrenceListComponent },
      // A criação/edição é para perfis com permissão de edição
      { path: 'general-occurrences/new', component: GeneralOccurrenceFormComponent, canActivate: [editingAccessGuard] },
      { path: 'general-occurrences/edit/:id', component: GeneralOccurrenceFormComponent, canActivate: [editingAccessGuard] },


      // Módulos Administrativos (SUPER_ADMIN, SERVIDOR_ADMINISTRATIVO)
      { path: 'authorities', component: AuthorityListComponent, canActivate: [adminGuard] },
      { path: 'authorities/new', component: AuthorityFormComponent, canActivate: [adminGuard] },
      { path: 'authorities/edit/:id', component: AuthorityFormComponent, canActivate: [adminGuard] },

      { path: 'cities', component: CityListComponent, canActivate: [adminGuard] },
      { path: 'cities/new', component: CityFormComponent, canActivate: [adminGuard] },
      { path: 'cities/edit/:id', component: CityFormComponent, canActivate: [adminGuard] },

      { path: 'procedures', component: ProcedureListComponent, canActivate: [adminGuard] },
      { path: 'procedures/new', component: ProcedureFormComponent, canActivate: [adminGuard] },
      { path: 'procedures/edit/:id', component: ProcedureFormComponent, canActivate: [adminGuard] },

      { path: 'forensic-services', component: ForensicServicesListComponent, canActivate: [adminGuard] },
      { path: 'forensic-services/new', component: ForensicServicesFormComponent, canActivate: [adminGuard] },
      { path: 'forensic-services/edit/:id', component: ForensicServicesFormComponent, canActivate: [adminGuard] },

      { path: 'occurrence-classifications', component: OccurrenceClassificationListComponent, canActivate: [adminGuard] },
      { path: 'occurrence-classifications/new', component: OccurrenceClassificationFormComponent, canActivate: [adminGuard] },
      { path: 'occurrence-classifications/edit/:id', component: OccurrenceClassificationFormComponent, canActivate: [adminGuard] },

      // --- NOVAS ROTAS ---
      { path: 'requesting-units', component: RequestingUnitListComponent, canActivate: [adminGuard] },
      { path: 'requesting-units/new', component: RequestingUnitFormComponent, canActivate: [adminGuard] },
      { path: 'requesting-units/edit/:id', component: RequestingUnitFormComponent, canActivate: [adminGuard] },

      // Módulos de Edição Estendida (SUPER_ADMIN, SERVIDOR_ADMINISTRATIVO, PERITO_OFICIAL)
      { path: 'exam-types', component: ExamTypeListComponent },
      { path: 'exam-types/new', component: ExamTypeFormComponent, canActivate: [editingAccessGuard] },
      { path: 'exam-types/edit/:id', component: ExamTypeFormComponent, canActivate: [editingAccessGuard] },

      // Módulos APENAS para SUPER_ADMIN
      { path: 'users', component: UserListComponent, canActivate: [superAdminGuard] },
      { path: 'users/edit/:id', component: UserEditComponent, canActivate: [superAdminGuard] },
       {
        path: 'occurrence-movements',
        component: OccurrenceMovementsListComponent,
        canActivate: [editingAccessGuard]
      },


    ]
  },

  // Rota Coringa
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
