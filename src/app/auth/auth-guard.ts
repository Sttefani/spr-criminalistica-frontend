import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Apenas verifica se o usuário está logado
  const isLoggedIn = !!authService.getToken();

  if (!isLoggedIn) {
    console.log('Usuário não logado, redirecionando para login');
    router.navigate(['/login']);
    return false;
  }

  // Se estiver logado, permite acesso a qualquer rota
  // O controle de permissões será feito no backend
  console.log('Usuário logado, acesso permitido');
  return true;
};
