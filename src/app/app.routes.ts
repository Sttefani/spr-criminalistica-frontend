import { Routes } from '@angular/router';

// Componentes
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component.';
import { LayoutComponent } from './layout/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserEditComponent } from './pages/users/user-edit/user-edit.component';
import { AuthorityListComponent } from './pages/authorities/authority-list/authority-list.component';
import { AuthorityFormComponent } from './pages/authorities/authority-form/authority-form.component';
// Adicione aqui os imports para City e Procedure...
import { CityListComponent } from './pages/cities/city-list/city-list.component';
import { CityFormComponent } from './pages/cities/city-form/city-form.component';
import { ProcedureListComponent } from './pages/procedures/procedure-list/procedure-list.component';
import { ProcedureFormComponent } from './pages/procedures/procedure-form/procedure-form.component';

// Guardas
import { authGuard } from './auth/auth-guard';
import { adminGuard } from './auth/admin-guard';
import { superAdminGuard } from './auth/super-admin-guard'; // <-- Importe o novo guarda

export const routes: Routes = [
  // Rotas Públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rotas da Aplicação (Protegidas por Login)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard], // Protege todo o "prédio"
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Módulos de Usuários -> Protegido pelo superAdminGuard
      { path: 'users', component: UserListComponent, canActivate: [superAdminGuard] },
      { path: 'users/edit/:id', component: UserEditComponent, canActivate: [superAdminGuard] },

      // Módulos Administrativos Gerais -> Protegidos pelo adminGuard
      { path: 'authorities', component: AuthorityListComponent, canActivate: [adminGuard] },
      { path: 'authorities/new', component: AuthorityFormComponent, canActivate: [adminGuard] },
      { path: 'authorities/edit/:id', component: AuthorityFormComponent, canActivate: [adminGuard] },
      { path: 'cities', component: CityListComponent, canActivate: [adminGuard] },
      { path: 'cities/new', component: CityFormComponent, canActivate: [adminGuard] },
      { path: 'cities/edit/:id', component: CityFormComponent, canActivate: [adminGuard] },
      { path: 'procedures', component: ProcedureListComponent, canActivate: [adminGuard] },
      { path: 'procedures/new', component: ProcedureFormComponent, canActivate: [adminGuard] },
      { path: 'procedures/edit/:id', component: ProcedureFormComponent, canActivate: [adminGuard] },
    ]
  },

  // Rota Coringa
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
