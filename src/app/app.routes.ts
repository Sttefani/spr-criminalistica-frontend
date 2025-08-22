import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import {  RegisterComponent } from './auth/register/register';
import { Layout } from './layout/layout/layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { authGuard } from './auth/auth-guard';
import { UserListComponent } from './pages/users/user-list/user-list';
import { UserEditComponent } from './pages/users/user-edit/user-edit';

export const routes: Routes = [
  // --- GRUPO 1: Rotas de Autenticação (PÚBLICAS) ---
  // Estas rotas NÃO devem ter o guarda.
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: RegisterComponent
  },

  // --- GRUPO 2: Rotas da Aplicação (PROTEGIDAS) ---
  {
    path: '',
    component: Layout,
    // ==========================================================
    // O GUARDA VEM AQUI
    // Ele protegerá esta rota "mãe" e TODAS as suas rotas "filhas".
    // ==========================================================
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'users',
        component: UserListComponent
      },
      { // ✅ Chave de abertura adicionada
        path: 'users/edit/:id', // O ':id' é um parâmetro dinâmico
        component: UserEditComponent,
        canActivate: [authGuard] // Protegida também pelo adminGuard
      }
    ]
  },

  // --- GRUPO 3: Rota Coringa ---
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
