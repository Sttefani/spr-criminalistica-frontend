import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const userRole = authService.getUserRole();

  // Verifica se o perfil é EXATAMENTE 'super_admin'
  if (userRole && userRole.toLowerCase() === 'super_admin') {
    return true;
  } else {
    snackBar.open('Acesso negado. Apenas Super Administradores.', 'Fechar', { duration: 4000 });
    router.navigate(['/dashboard']);
    return false;
  }
};
