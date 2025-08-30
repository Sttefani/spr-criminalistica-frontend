import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para dar tipo aos dados de Local
export interface Location {
  id?: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/locations'; // Endpoint da API

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // GET /locations (com paginação e busca)
  getLocations(page: number, limit: number, search: string): Observable<any> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) {
      params = params.append('search', search);
    }
    return this.http.get(this.apiUrl, { headers, params });
  }

  // GET /locations/:id
  getLocation(id: string): Observable<Location> {
    const headers = this.getAuthHeaders();
    return this.http.get<Location>(`${this.apiUrl}/${id}`, { headers });
  }

  // POST /locations
  createLocation(data: Omit<Location, 'id'>): Observable<Location> {
    const headers = this.getAuthHeaders();
    return this.http.post<Location>(this.apiUrl, data, { headers });
  }

  // PATCH /locations/:id
  updateLocation(id: string, data: Partial<Location>): Observable<Location> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Location>(`${this.apiUrl}/${id}`, data, { headers });
  }

  // DELETE /locations/:id
  deleteLocation(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
