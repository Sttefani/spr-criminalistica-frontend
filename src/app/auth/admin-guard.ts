import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // <-- Importe o SnackBar

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar); // <-- Injete o SnackBar
  const userRole = authService.getUserRole();

  const allowedRoles = ['super_admin', 'servidor_administrativo'];

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  } else {
    // Mostra uma mensagem de erro clara
    snackBar.open('Acesso negado. Você não tem permissão para esta área.', 'Fechar', {
      duration: 4000,
      panelClass: ['snackbar-error']
    });
    // Redireciona de volta para o dashboard
    router.navigate(['/dashboard']);
    return false;
  }
};
