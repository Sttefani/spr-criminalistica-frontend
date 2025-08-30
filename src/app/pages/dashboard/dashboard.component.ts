import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; // <-- 1. IMPORTAÇÃO NOVA
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule, // <-- 2. ADICIONE AOS IMPORTS
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  userRole: string | null = null;
  // ==========================================================
  // 3. ADICIONE A PROPRIEDADE PARA CONTROLAR O ACESSO
  // ==========================================================
  canAccessAdminModules = false;
  canAccessEditingModules = false; // ADICIONE ESTA LINHA

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();

    // Define a permissão com base nos perfis administrativos
    const adminRoles = ['super_admin', 'servidor_administrativo', 'perito_oficial'];
    if (this.userRole && adminRoles.includes(this.userRole)) {
      this.canAccessAdminModules = true;
    }
  }
}
