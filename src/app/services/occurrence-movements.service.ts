import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Suas interfaces (mantém iguais)
export interface OccurrenceMovementResponse {
  id: string;
  occurrenceId: string;
  description: string;
  deadline: Date | null;
  originalDeadline: Date | null;
  isOverdue: boolean;
  isNearDeadline: boolean;
  wasExtended: boolean;
  extensionJustification: string | null;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  performedAt: Date;
  isSystemGenerated: boolean;
  additionalData: any;
}

export interface CreateMovementRequest {
  occurrenceId: string;
  description: string;
  deadline?: Date;
  wasExtended?: boolean;
  extensionJustification?: string;
  additionalData?: any;
}

export interface ExtendDeadlineRequest {
  extensionDays: number;
  justification: string;
}

@Injectable({
  providedIn: 'root'
})
export class OccurrenceMovementsService {
  private apiUrl = 'http://localhost:3000/occurrence-movements';

  constructor(private http: HttpClient) {}

  // ✅ CORRIGIDO - Agora procura pelos nomes corretos dos tokens
  private getHeaders(): HttpHeaders {
    // Procurar pelos nomes REAIS dos tokens que você usa
    const authToken = localStorage.getItem('auth_token');
    const accessToken = localStorage.getItem('access_token');

    // Preferir auth_token (que é o válido)
    const token = authToken || accessToken;

    console.log('=== DIAGNÓSTICO DO TOKEN ===');
    console.log('auth_token existe:', !!authToken);
    console.log('access_token existe:', !!accessToken);
    console.log('Token escolhido:', token ? 'EXISTE' : 'NÃO EXISTE');

    if (token) {
      console.log('Primeiros 20 caracteres:', token.substring(0, 20) + '...');

      // Verificar se o token está expirado
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        console.log('Token expirado?', isExpired);
        if (isExpired) {
          console.log('⚠️ TOKEN EXPIRADO! Faça login novamente.');
        }
      } catch(e) {
        console.log('Erro ao verificar expiração:', e);
      }
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createMovement(request: CreateMovementRequest): Observable<OccurrenceMovementResponse> {
    return this.http.post<OccurrenceMovementResponse>(this.apiUrl, request, { headers: this.getHeaders() });
  }

  getOccurrenceMovements(occurrenceId: string): Observable<OccurrenceMovementResponse[]> {
    return this.http.get<OccurrenceMovementResponse[]>(`${this.apiUrl}/occurrence/${occurrenceId}`, { headers: this.getHeaders() });
  }

  getOccurrencesWithDeadlineStatus(): Observable<any[]> {
    console.log('=== FAZENDO REQUISIÇÃO COM TOKEN CORRETO ===');
    return this.http.get<any[]>(`${this.apiUrl}/deadline-status`, { headers: this.getHeaders() });
  }

  extendDeadline(occurrenceId: string, request: ExtendDeadlineRequest): Observable<OccurrenceMovementResponse> {
    return this.http.post<OccurrenceMovementResponse>(`${this.apiUrl}/extend-deadline/${occurrenceId}`, request, { headers: this.getHeaders() });
  }

  deleteMovement(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateDeadlineFlags(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/update-deadline-flags`, {}, { headers: this.getHeaders() });
  }
}
