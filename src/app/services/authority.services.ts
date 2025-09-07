import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// A importação do AuthService foi REMOVIDA

@Injectable({
  providedIn: 'root'
})
export class AuthorityService {
  private apiUrl = 'http://localhost:3000/authorities';

  // A injeção do AuthService foi REMOVIDA do construtor
  constructor(private http: HttpClient) {}

  /**
   * ESTE É O NOVO MÉTODO
   * Ele monta o cabeçalho de autorização lendo o token diretamente do localStorage.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Busca a lista de todas as autoridades.
   */
  getAuthorities(): Observable<any[]> {
    const headers = this.getAuthHeaders(); // <-- USA o novo método
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  /**
   * Busca uma única autoridade pelo ID.
   */
  getAuthority(id: string): Observable<any> {
    const headers = this.getAuthHeaders(); // <-- USA o novo método
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Cria uma nova autoridade.
   */
  createAuthority(data: any): Observable<any> {
    const headers = this.getAuthHeaders(); // <-- USA o novo método
    return this.http.post<any>(this.apiUrl, data, { headers });
  }

  /**
   * Atualiza uma autoridade existente.
   */
  updateAuthority(id: string, data: any): Observable<any> {
    const headers = this.getAuthHeaders(); // <-- USA o novo método
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data, { headers });
  }

  /**
   * Deleta (soft delete) uma autoridade.
   */
  deleteAuthority(id: string): Observable<any> {
    const headers = this.getAuthHeaders(); // <-- USA o novo método
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }

}
