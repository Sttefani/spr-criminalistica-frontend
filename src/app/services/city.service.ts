import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para dar tipo aos dados de Cidade
export interface City {
  id?: string;
  name: string;
  state: string;
}

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = 'http://localhost:3000/cities';

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
   * Busca a lista de todas as cidades.
   */
  getCities(): Observable<City[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<City[]>(this.apiUrl, { headers });
  }

  /**
   * Busca uma única cidade pelo ID.
   */
  getCity(id: string): Observable<City> {
    const headers = this.getAuthHeaders();
    return this.http.get<City>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Cria uma nova cidade.
   */
  createCity(data: Pick<City, 'name' | 'state'>): Observable<City> {
    const headers = this.getAuthHeaders();
    return this.http.post<City>(this.apiUrl, data, { headers });
  }

  /**
   * Atualiza uma cidade existente.
   */
  updateCity(id: string, data: Partial<City>): Observable<City> {
    const headers = this.getAuthHeaders();
    return this.http.patch<City>(`${this.apiUrl}/${id}`, data, { headers });
  }

  /**
   * Deleta (soft delete) uma cidade.
   */
  deleteCity(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
