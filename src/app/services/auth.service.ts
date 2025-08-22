import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

// Interface para definir a estrutura do nosso token decodificado
interface DecodedToken {
  sub: string;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private authTokenKey = 'auth_token';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData);
  }

  login(credentials: any): Observable<any> {
    const payload = {
      email: credentials.email,
      password: credentials.password
    };

    console.log('=== DEBUG LOGIN FRONTEND ===');
    console.log('Credentials recebidos:', credentials);
    console.log('Payload sendo enviado:', payload);
    console.log('URL:', `${this.apiUrl}/auth/login`);

    return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap({
        next: (response) => {
          console.log('✅ Resposta recebida do backend:', response);
          console.log('Token presente na resposta:', !!response?.access_token);

          if (response && response.access_token) {
            console.log('--- SALVANDO TOKEN ---');
            console.log('Token recebido (primeiros 50 chars):', response.access_token.substring(0, 50) + '...');

            // Salva o token
            this.saveToken(response.access_token);
            console.log('Token salvo no localStorage');

            // Verifica se foi salvo corretamente
            const savedToken = this.getToken();
            console.log('Token salvo verificado:', !!savedToken);
            console.log('Token salvo confere:', savedToken === response.access_token);

            // Atualiza estado de login
            console.log('--- ATUALIZANDO ESTADO ---');
            console.log('Estado atual do loggedIn:', this.loggedIn.value);
            this.loggedIn.next(true);
            console.log('Estado atualizado para:', this.loggedIn.value);

            // Tenta decodificar o token
            console.log('--- DECODIFICANDO TOKEN ---');
            try {
              const decoded = this.getDecodedToken();
              console.log('Token decodificado:', decoded);
            } catch (error) {
              console.error('Erro ao decodificar token:', error);
            }

            console.log('✅ Login processado com sucesso no AuthService');
          } else {
            console.error('❌ Resposta sem token válido!');
            console.error('Estrutura da resposta:', Object.keys(response || {}));
          }
        },
        error: (error) => {
          console.error('❌ Erro na requisição de login:', error);
          console.error('Status do erro:', error.status);
          console.error('Mensagem do erro:', error.message);
          console.error('Erro completo:', error);
        }
      })
    );
  }

  logout(): void {
    console.log('=== LOGOUT ===');
    localStorage.removeItem(this.authTokenKey);
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  private hasToken(): boolean {
    const hasToken = !!localStorage.getItem(this.authTokenKey);
    console.log('Verificando se tem token:', hasToken);
    return hasToken;
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode<DecodedToken>(token);
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        this.logout();
        return null;
      }
    }
    return null;
  }

  getUserName(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.name : null;
  }

  getUserRole(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.role : null;
  }

  private saveToken(token: string): void {
    console.log('Salvando token no localStorage...');
    localStorage.setItem(this.authTokenKey, token);
    console.log('Token salvo com chave:', this.authTokenKey);
  }
}
