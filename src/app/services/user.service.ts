import { Injectable } from '@angular/core';
// ==========================================================
// 1. IMPORTAÇÃO NECESSÁRIA PARA CONSTRUIR URLs COM PARÂMETROS
// ==========================================================
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ==========================================================
  // 2. A CORREÇÃO NO MÉTODO getUsers
  // Agora ele aceita um parâmetro opcional 'status'.
  // ==========================================================
  getUsers(status?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams();

    // Se um status for fornecido e não for 'all', o adicionamos como um
    // parâmetro de query na URL (ex: /users?status=pending)
    if (status && status !== 'all') {
      params = params.append('status', status);
    }

    // A requisição GET agora inclui os cabeçalhos e os parâmetros
    return this.http.get(this.apiUrl, { headers, params });
  }

  // O resto dos seus métodos (findOne, update, approveUser, etc.)
  // permanecem os mesmos e já estão corretos.
  findOne(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/${id}`, { headers });
  }

  update(id: string, userData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}`, userData, { headers });
  }

  approveUser(userId: string, role: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { role };
    return this.http.patch(`${this.apiUrl}/${userId}/approve`, body, { headers });
  }

  rejectUser(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${userId}/reject`, {}, { headers });
  }

  updateUserStatus(userId: string, status: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { status };
    return this.http.patch(`${this.apiUrl}/${userId}`, body, { headers });
  }
}
