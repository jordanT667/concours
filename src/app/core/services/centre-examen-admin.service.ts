import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CentreExamenDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class CentreExamenAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/centres-examen`;
  private readonly API = `${environment.apiUrl}/centres-examen`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<CentreExamenDto[]> { return this.http.get<CentreExamenDto[]>(this.PUB); }
  create(dto: CentreExamenDto): Observable<CentreExamenDto> { return this.http.post<CentreExamenDto>(this.API, dto); }
  update(idCexam: string, dto: CentreExamenDto): Observable<CentreExamenDto> { return this.http.put<CentreExamenDto>(`${this.API}/${idCexam}`, dto); }
  delete(idCexam: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idCexam}`); }
}
