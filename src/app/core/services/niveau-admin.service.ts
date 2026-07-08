import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NiveauDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class NiveauAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/niveaux`;
  private readonly API = `${environment.apiUrl}/niveaux`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<NiveauDto[]> { return this.http.get<NiveauDto[]>(this.PUB); }
  create(dto: NiveauDto): Observable<NiveauDto> { return this.http.post<NiveauDto>(this.API, dto); }
  update(code: string, dto: NiveauDto): Observable<NiveauDto> { return this.http.put<NiveauDto>(`${this.API}/${code}`, dto); }
  updateCursus(code: string, cursusIds: string[]): Observable<NiveauDto> { return this.http.put<NiveauDto>(`${this.API}/${code}/cursus`, cursusIds); }
  delete(code: string): Observable<void> { return this.http.delete<void>(`${this.API}/${code}`); }
}
