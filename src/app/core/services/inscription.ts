import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InscriptionResponseDto,
  SoumettreInscriptionPayload,
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
}
