import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const editingAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const userRole = authService.getUserRole();
  const allowedRoles = ['super_admin', 'servidor_administrativo', 'perito_oficial'];

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }
  snackBar.open('Acesso negado. Permissão para edição necessária.', 'Fechar', { duration: 4000 });
  router.navigate(['/dashboard']);
  return false;
};
