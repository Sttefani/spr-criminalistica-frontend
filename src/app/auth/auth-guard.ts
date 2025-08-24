import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Apenas verifica se o usuário tem um token
  if (authService.getToken()) {
    // Se tem token, está logado. Permite o acesso.
    return true;
  } else {
    // Se não tem token, não está logado. Redireciona para /login.
    router.navigate(['/login']);
    return false;
  }
};
