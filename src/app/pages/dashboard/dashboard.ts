import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardContent,
    MatCardModule
],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  userRole: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
  }
}
