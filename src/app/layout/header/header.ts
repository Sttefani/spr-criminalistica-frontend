import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit, OnDestroy {
  dataHoraAtual: Date = new Date();
  private timerId: any;

  // Propriedades para reatividade
  isLoggedIn$!: Observable<boolean>;
  userName: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.timerId = setInterval(() => { this.dataHoraAtual = new Date(); }, 1000);

    // Conecta-se ao observable do AuthService para saber o status do login
    this.isLoggedIn$ = this.authService.isLoggedIn$;

    // Pega o nome do usuário se ele já estiver logado
    this.userName = this.authService.getUserName();

    // Ouve as mudanças no status de login para atualizar o nome do usuário
    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.userName = this.authService.getUserName();
      } else {
        this.userName = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerId) { clearInterval(this.timerId); }
  }

  logout(): void {
    // A lógica de logout (incluindo o redirecionamento) agora está centralizada no serviço
    this.authService.logout();
  }
}
