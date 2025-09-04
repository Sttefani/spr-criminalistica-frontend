import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para dar tipo aos dados
export interface RequestingUnit {
  id?: string;
  name: string;
  acronym: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestingUnitService {
  private apiUrl = 'http://localhost:3000/requesting-units';

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
   * Busca a lista de Unidades Demandantes com paginação e busca.
   */
  getRequestingUnits(page: number, limit: number, search: string): Observable<any> {
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
   * Busca uma única Unidade Demandante pelo ID.
   */
  getRequestingUnit(id: string): Observable<RequestingUnit> {
    const headers = this.getAuthHeaders();
    return this.http.get<RequestingUnit>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Cria uma nova Unidade Demandante.
   */
  createRequestingUnit(data: Omit<RequestingUnit, 'id'>): Observable<RequestingUnit> {
    const headers = this.getAuthHeaders();
    return this.http.post<RequestingUnit>(this.apiUrl, data, { headers });
  }

  /**
   * Atualiza uma Unidade Demandante existente.
   */
  updateRequestingUnit(id: string, data: Partial<RequestingUnit>): Observable<RequestingUnit> {
    const headers = this.getAuthHeaders();
    return this.http.patch<RequestingUnit>(`${this.apiUrl}/${id}`, data, { headers });
  }

  /**
   * Deleta (soft delete) uma Unidade Demandante.
   */
  deleteRequestingUnit(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
