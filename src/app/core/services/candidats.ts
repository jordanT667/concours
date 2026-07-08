import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CandidatDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroCNI: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ADMIS' | 'NON_ADMIS';
}

@Injectable({ providedIn: 'root' })
export class CandidatsService {
  private readonly API = `${environment.apiUrl}/candidats`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CandidatDto[]> {
    return this.http.get<CandidatDto[]>(this.API);
  }

  getById(id: number): Observable<CandidatDto> {
    return this.http.get<CandidatDto>(`${this.API}/${id}`);
  }
}
