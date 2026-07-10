import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiliereDto } from '../models/filiere.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FiliereService {
  private readonly API        = `${environment.apiUrl}/filieres`;
  private readonly API_PUBLIC = `${environment.apiUrl}/concours`;

  constructor(private http: HttpClient) {}

  // Lecture publique → GET /api/v1/concours/filiere
  getAll(): Observable<FiliereDto[]> {
    return this.http.get<FiliereDto[]>(`${this.API_PUBLIC}/filiere`);
  }

  // Recherche par cursus/niveau/école → GET /api/v1/concours/searchfiliere
  search(idCursus = '*', codeNiveau = '*', codeEcole = '*'): Observable<FiliereDto[]> {
    return this.http.get<FiliereDto[]>(`${this.API_PUBLIC}/searchfiliere`, {
      params: { idCursus, codeNiveau, codeEcole }
    });
  }

  // CRUD admin → /api/v1/filieres
  create(dto: FiliereDto): Observable<FiliereDto> {
    return this.http.post<FiliereDto>(this.API, dto);
  }

  update(codeFiliere: string, dto: FiliereDto): Observable<FiliereDto> {
    return this.http.put<FiliereDto>(`${this.API}/${codeFiliere}`, dto);
  }

  delete(codeFiliere: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${codeFiliere}`);
  }
}
