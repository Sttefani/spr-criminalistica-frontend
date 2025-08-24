import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorityService {
  private apiUrl = 'http://localhost:3000/authorities';

  constructor(private http: HttpClient) {}

  /**
   * Monta o cabeçalho de autorização lendo o token do localStorage.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // Lê o token diretamente
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Busca a lista de todas as autoridades.
   */
  getAuthorities(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  /**
   * Busca os dados de uma única autoridade pelo ID.
   */
  getAuthority(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Cria uma nova autoridade.
   */
  createAuthority(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(this.apiUrl, data, { headers });
  }

  /**
   * Atualiza os dados de uma autoridade.
   */
  updateAuthority(id: string, data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data, { headers });
  }

  /**
   * Deleta (soft delete) uma autoridade.
   */
  deleteAuthority(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
