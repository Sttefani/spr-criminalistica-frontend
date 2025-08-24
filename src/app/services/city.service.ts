import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

// Interface para dar tipo aos dados de Cidade
export interface City {
  id?: string;
  name: string;
  state: string; // Assumindo os campos 'name' e 'state'
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = 'http://localhost:3000/cities';

  constructor(private http: HttpClient) {}

  // ==========================================================
  // O MÉTODO ESSENCIAL PARA ADICIONAR O TOKEN
  // ==========================================================
  private getAuthHeaders(): HttpHeaders | null {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[CityService] Token de autenticação não encontrado.');
      return null;
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Todos os métodos abaixo agora usam a autenticação

  getCities(): Observable<City[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.get<City[]>(this.apiUrl, { headers });
  }

  getCity(id: string): Observable<City> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.get<City>(`${this.apiUrl}/${id}`, { headers });
  }

  createCity(data: Pick<City, 'name' | 'state'>): Observable<City> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.post<City>(this.apiUrl, data, { headers });
  }

  updateCity(id: string, data: Partial<City>): Observable<City> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.patch<City>(`${this.apiUrl}/${id}`, data, { headers });
  }

  deleteCity(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('Não autenticado'));
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
