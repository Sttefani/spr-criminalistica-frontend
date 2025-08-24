import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Serviços
// import { AuthService } from '../../../services/auth.service'; // <-- REMOVEMOS A IMPORTAÇÃO

// Importamos o jwt-decode para pegar o perfil diretamente
import { jwtDecode } from 'jwt-decode';
import { AuthorityService } from '../../../services/authority.services';

// Interface para dar tipo ao nosso token decodificado
interface DecodedToken {
  role: string;
}

@Component({
  selector: 'app-authority-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './authority-list.html',
  styleUrls: ['./authority-list.scss']
})
export class AuthorityListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['name', 'title', 'linkedUser', 'actions'];
  userRole: string | null = null;
  canCreateOrEdit = false;
  isSuperAdmin = false;

  // ==========================================================
  // A MUDANÇA É AQUI: Removemos o AuthService do construtor
  // ==========================================================
  constructor(
    private authorityService: AuthorityService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Pegamos as permissões diretamente do token
    this.setUserPermissions();
    this.loadAuthorities();
  }

  // Novo método para ler o token e definir as permissões
  private setUserPermissions(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        this.userRole = decodedToken.role;
      } catch (error) {
        console.error('Erro ao decodificar token no AuthorityList:', error);
        this.userRole = null;
      }
    }

    this.isSuperAdmin = this.userRole === 'super_admin';
    this.canCreateOrEdit = this.isSuperAdmin || this.userRole === 'servidor_administrativo';
  }

  loadAuthorities(): void {
    this.authorityService.getAuthorities().subscribe({
      next: (data) => { this.dataSource.data = data; },
      error: (err) => { /* ... seu tratamento de erro ... */ }
    });
  }

  deleteAuthority(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta autoridade?')) {
      this.authorityService.deleteAuthority(id).subscribe({
        next: () => {
          this.snackBar.open('Autoridade excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadAuthorities();
        },
        error: (err) => { /* ... seu tratamento de erro ... */ }
      });
    }
  }
}
