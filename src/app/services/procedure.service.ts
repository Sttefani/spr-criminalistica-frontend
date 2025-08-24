import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

// ==========================================================
// A CORREÇÃO PRINCIPAL É AQUI: A interface agora corresponde ao backend
// ==========================================================
export interface Procedure {
  id?: string;
  name: string;
  acronym: string; // Adicionado
  // 'description' foi removido
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProcedureService {
  private readonly apiUrl = 'http://localhost:3000/procedures';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders | null {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[ProcedureService] Token de autenticação não encontrado.');
      return null;
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Lista todos os procedimentos
  getProcedures(): Observable<Procedure[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.get<Procedure[]>(this.apiUrl, { headers });
  }

  // Obtém um procedimento específico por ID
  getProcedure(id: string): Observable<Procedure> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.get<Procedure>(`${this.apiUrl}/${id}`, { headers });
  }

  // Cria um novo procedimento
  // O tipo do 'data' agora está correto, esperando 'name' e 'acronym'
  createProcedure(data: Pick<Procedure, 'name' | 'acronym'>): Observable<Procedure> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.post<Procedure>(this.apiUrl, data, { headers });
  }

  // Atualiza um procedimento existente
  updateProcedure(id: string, data: Partial<Procedure>): Observable<Procedure> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.patch<Procedure>(`${this.apiUrl}/${id}`, data, { headers });
  }

  // Exclui um procedimento
  deleteProcedure(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
