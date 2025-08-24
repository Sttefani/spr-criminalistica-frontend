import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  /**
   * Monta o cabeçalho de autorização lendo o token do localStorage.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Busca a lista de usuários da API com paginação e filtros.
   */
  getUsers(page: number, limit: number, status: string, search: string): Observable<any> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status && status !== 'all') {
      params = params.append('status', status);
    }
    if (search) {
      params = params.append('search', search);
    }

    return this.http.get(this.apiUrl, { headers, params });
  }

  /**
   * Busca os dados de um único usuário pelo ID.
   */
  findOne(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Atualiza os dados de um usuário (usado pelo formulário de edição).
   */
  update(id: string, userData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}`, userData, { headers });
  }

  /**
   * Aprova um usuário pendente, atribuindo um perfil.
   */
  approveUser(userId: string, role: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { role };
    return this.http.patch(`${this.apiUrl}/${userId}/approve`, body, { headers });
  }

  /**
   * Rejeita um usuário pendente.
   */
  rejectUser(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${userId}/reject`, {}, { headers });
  }

  /**
   * Atualiza o status de um usuário (para 'active' ou 'inactive').
   */
  updateUserStatus(userId: string, status: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { status };
    return this.http.patch(`${this.apiUrl}/${userId}`, body, { headers });
  }
  getAllUsers(): Observable<any> {
  const headers = this.getAuthHeaders();
  // Chama o endpoint sem parâmetros de paginação
  return this.http.get(this.apiUrl, { headers });
}
}
