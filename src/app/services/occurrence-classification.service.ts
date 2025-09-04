import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OccurrenceClassification {
  data: any[];
  id?: string;
  code: string;
  name: string;
  group?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OccurrenceClassificationService {
  private apiUrl = 'http://localhost:3000/occurrence-classifications';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getClassifications(page: number, limit: number, search: string, group: string): Observable<any> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.append('search', search);
    }
    if (group && group !== 'all') {
      params = params.append('group', group);
    }
    return this.http.get<any>(this.apiUrl, { headers, params });
  }

  getAllGroups(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<string[]>(`${this.apiUrl}/groups/all`, { headers });
  }

  // MÉTODO CORRIGIDO AQUI
  getClassification(id: string): Observable<OccurrenceClassification> {
    const headers = this.getAuthHeaders();
    return this.http.get<OccurrenceClassification>(`${this.apiUrl}/${id}`, { headers });
  }

  createClassification(data: Omit<OccurrenceClassification, 'id'>): Observable<OccurrenceClassification> {
    const headers = this.getAuthHeaders();
    return this.http.post<OccurrenceClassification>(this.apiUrl, data, { headers });
  }

  updateClassification(id: string, data: Partial<OccurrenceClassification>): Observable<OccurrenceClassification> {
    const headers = this.getAuthHeaders();
    return this.http.patch<OccurrenceClassification>(`${this.apiUrl}/${id}`, data, { headers });
  }

  deleteClassification(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
