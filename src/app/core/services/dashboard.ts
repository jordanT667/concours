import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalInscriptions: number;
  inscriptionsValidees: number;
  inscriptionsEnAttente: number;
  inscriptionsRejetees: number;
  totalCandidats: number;
  totalCentres: number;
  totalFilieres: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API}/stats`);
  }
}
