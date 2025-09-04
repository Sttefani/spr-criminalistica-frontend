import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para dar tipo aos dados de Procedimento
export interface Procedure {
  id?: string;
  name: string;
  acronym: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProcedureService {
  private apiUrl = 'http://localhost:3000/procedures';

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
   * Busca a lista de todos os procedimentos (sem paginação).
   */
  getProcedures(): Observable<Procedure[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Procedure[]>(this.apiUrl, { headers });
  }

  /**
   * Busca um único procedimento pelo ID.
   */
  getProcedure(id: string): Observable<Procedure> {
    const headers = this.getAuthHeaders();
    return this.http.get<Procedure>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Cria um novo procedimento.
   */
  createProcedure(data: Pick<Procedure, 'name' | 'acronym'>): Observable<Procedure> {
    const headers = this.getAuthHeaders();
    return this.http.post<Procedure>(this.apiUrl, data, { headers });
  }

  /**
   * Atualiza um procedimento existente.
   */
  updateProcedure(id: string, data: Partial<Procedure>): Observable<Procedure> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Procedure>(`${this.apiUrl}/${id}`, data, { headers });
  }

  /**
   * Deleta (soft delete) um procedimento.
   */
  deleteProcedure(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
