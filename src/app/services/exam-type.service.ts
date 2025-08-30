import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para dar um tipo aos nossos dados, garantindo consistência
export interface ExamType {
  id?: string;
  name: string;
  acronym: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExamTypeService {
  private apiUrl = 'http://localhost:3000/exam-types';

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
   * Busca a lista de tipos de exame com paginação e busca.
   */
  getExamTypes(page: number, limit: number, search: string): Observable<any> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) {
      params = params.append('search', search);
    }
    return this.http.get(this.apiUrl, { headers, params });
  }

  /**
   * Busca um único tipo de exame pelo ID.
   */
  getExamType(id: string): Observable<ExamType> {
    const headers = this.getAuthHeaders();
    return this.http.get<ExamType>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Cria um novo tipo de exame.
   */
  createExamType(data: Omit<ExamType, 'id'>): Observable<ExamType> {
    const headers = this.getAuthHeaders();
    return this.http.post<ExamType>(this.apiUrl, data, { headers });
  }

  /**
   * Atualiza um tipo de exame existente.
   */
  updateExamType(id: string, data: Partial<ExamType>): Observable<ExamType> {
    const headers = this.getAuthHeaders();
    return this.http.patch<ExamType>(`${this.apiUrl}/${id}`, data, { headers });
  }

  /**
   * Deleta (soft delete) um tipo de exame.
   */
  deleteExamType(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
