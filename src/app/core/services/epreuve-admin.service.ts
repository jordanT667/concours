import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EpreuveMatiereDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class EpreuveAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/epreuve/matieres`;
  private readonly API = `${environment.apiUrl}/epreuves`;
  constructor(private http: HttpClient) {}

  getMatieres(codefilere: string, idcursus: string, codeNiveau: string, iddiplome: string): Observable<EpreuveMatiereDto[]> {
    const params = new HttpParams()
      .set('codefilere', codefilere)
      .set('idcursus', idcursus)
      .set('codeNiveau', codeNiveau)
      .set('iddiplome', iddiplome);
    return this.http.get<EpreuveMatiereDto[]>(this.PUB, { params });
  }

  update(body: { codefilere: string; idcursus: string; codeNiveau: string; iddiplome: string; idMatieres: string[] }): Observable<void> {
    return this.http.put<void>(this.API, body);
  }

  delete(codefilere: string, idcursus: string, codeNiveau: string, iddiplome: string): Observable<void> {
    const params = new HttpParams()
      .set('codefilere', codefilere)
      .set('idcursus', idcursus)
      .set('codeNiveau', codeNiveau)
      .set('iddiplome', iddiplome);
    return this.http.delete<void>(this.API, { params });
  }
}
