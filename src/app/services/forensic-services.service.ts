import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================================
// A INTERFACE CORRIGIDA: Sem 'description'
// ==========================================================
export interface ForensicServiceData {
  id?: string;
  name: string;
  acronym: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ForensicService {
  private apiUrl = 'http://localhost:3000/forensic-services';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getForensicServices(page: number, limit: number, search: string): Observable<any> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (search) {
      params = params.append('search', search);
    }
    return this.http.get<any>(this.apiUrl, { headers, params });
  }

  getForensicService(id: string): Observable<ForensicServiceData> {
    const headers = this.getAuthHeaders();
    return this.http.get<ForensicServiceData>(`${this.apiUrl}/${id}`, { headers });
  }

  // O tipo de 'data' agora está correto, esperando 'name' e 'acronym'
  createForensicService(data: Pick<ForensicServiceData, 'name' | 'acronym'>): Observable<ForensicServiceData> {
    const headers = this.getAuthHeaders();
    return this.http.post<ForensicServiceData>(this.apiUrl, data, { headers });
  }

  updateForensicService(id: string, data: Partial<ForensicServiceData>): Observable<ForensicServiceData> {
    const headers = this.getAuthHeaders();
    return this.http.patch<ForensicServiceData>(`${this.apiUrl}/${id}`, data, { headers });
  }

  deleteForensicService(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
  /**
 * Busca todos os serviços forenses sem paginação (para dropdowns/seleções).
 */
getAllForensicServices(): Observable<ForensicServiceData[]> {
  const headers = this.getAuthHeaders();
  const params = new HttpParams()
    .set('page', '1')
    .set('limit', '1000'); // Limite alto para pegar todos
  return this.http.get<any>(this.apiUrl, { headers, params });
}
}
