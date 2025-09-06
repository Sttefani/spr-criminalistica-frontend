import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  userRole: string | null = null;
  canAccessAdminModules = false;
  canAccessMovements = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();

    // Módulos administrativos: apenas super_admin e servidor_administrativo
    this.canAccessAdminModules = ['super_admin', 'servidor_administrativo'].includes(this.userRole || '');

    // Movimentações: super_admin, servidor_administrativo E perito_oficial
    this.canAccessMovements = ['super_admin', 'servidor_administrativo', 'perito_oficial'].includes(this.userRole || '');
  }
}
