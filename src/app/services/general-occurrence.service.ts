import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================================
// INTERFACES QUE REPRESENTAM OS DADOS VINDOS DO BACKEND
// Elas espelham suas entidades para uma tipagem forte.
// ==========================================================
export interface BaseEntity {
  id: string;
  name: string;
}

export interface UserReference extends BaseEntity {
  email: string;
}

export interface GeneralOccurrence {
  forensicService:BaseEntity;
  id?: string;
  caseNumber: string | null;
  procedure: BaseEntity | null;
  procedureNumber: string | null;
  occurrenceDate: Date;
  history: string;
  responsibleExpert: UserReference | null;
  requestingUnit: BaseEntity | null;
  requestingAuthority: BaseEntity | null;
  city: BaseEntity;
  occurrenceClassification: BaseEntity | null;
  examTypes: BaseEntity[] | null;
  status: string;
  createdBy: UserReference;
  isLocked: boolean;
  additionalFields: any;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para os dados que o formulário envia (apenas os IDs)
export interface GeneralOccurrenceForm {
  procedureId: string | null;
  procedureNumber: string | null;
  occurrenceDate: Date;
  history: string;
  forensicServiceId: string; // CORRIGIDO: forensicServiceId -> locationServiceId
  responsibleExpertId: string | null;
  requestingUnitId: string | null;
  requestingAuthorityId: string | null;
  cityId: string;
  status: string;
  examTypeIds: string[];
  isLocked: boolean;
  additionalFields: any;
}

@Injectable({
  providedIn: 'root'
})
export class GeneralOccurrenceService {
  private apiUrl = 'http://localhost:3000/general-occurrences';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  /**
   * Busca a lista de ocorrências com paginação e busca.
   */
   getOccurrences(
    page: number,
    limit: number,
    search?: string,
    forensicServiceId?: string, // <-- ADICIONADO
    onlyMine?: boolean // <-- ADICIONADO
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.append('search', search);
    }
    // ✅ Adição dos novos filtros aos parâmetros da requisição
    if (forensicServiceId && forensicServiceId !== 'all') {
      params = params.append('forensicServiceId', forensicServiceId);
    }
    if (onlyMine) {
      params = params.append('onlyMine', 'true');
    }

    return this.http.get<any>(this.apiUrl, { headers, params });
  }
  /**
   * Busca uma única ocorrência pelo ID.
   */
  getOccurrence(id: string): Observable<GeneralOccurrence> {
    const headers = this.getAuthHeaders();
    return this.http.get<GeneralOccurrence>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Cria uma nova ocorrência.
   */
  createOccurrence(data: GeneralOccurrenceForm): Observable<GeneralOccurrence> {
    const headers = this.getAuthHeaders();
    return this.http.post<GeneralOccurrence>(this.apiUrl, data, { headers });
  }

  /**
   * Atualiza uma ocorrência existente.
   */
  updateOccurrence(id: string, data: Partial<GeneralOccurrenceForm>): Observable<GeneralOccurrence> {
    const headers = this.getAuthHeaders();
    return this.http.patch<GeneralOccurrence>(`${this.apiUrl}/${id}`, data, { headers });
  }

  /**
   * Deleta (soft delete) uma ocorrência.
   */
  deleteOccurrence(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Busca minhas ocorrências (dashboard pessoal)
   */
  getMyOccurrences(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/my-occurrences`, { headers });
  }

  /**
   * Busca ocorrências por status
   */
  getOccurrencesByStatus(status: string, page: number = 1, limit: number = 10): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/filter/by-status`, { headers, params });
  }

  /**
   * Busca estatísticas básicas
   */
  getStatsSummary(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/stats/summary`, { headers });
  }
}
