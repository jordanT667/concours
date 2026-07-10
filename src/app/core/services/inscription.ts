import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Inscription,
  InscriptionResponseDto,
  SoumettreInscriptionPayload,
  UpdateStatutDto,
} from '../models/inscription.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InscriptionService {
  private readonly API = `${environment.apiUrl}/inscriptions`;

  constructor(private http: HttpClient) {}

  soumettre(payload: SoumettreInscriptionPayload): Observable<InscriptionResponseDto> {
    return this.http.post<InscriptionResponseDto>(this.API, payload);
  }

  getAll(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.API);
  }

  getById(id: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.API}/${id}`);
  }

  updateStatut(id: number, dto: UpdateStatutDto): Observable<Inscription> {
    return this.http.patch<Inscription>(`${this.API}/${id}/statut`, dto);
  }
}
