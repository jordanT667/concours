import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EcoleDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class EcoleAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/ecoles`;
  private readonly API = `${environment.apiUrl}/ecoles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EcoleDto[]> { return this.http.get<EcoleDto[]>(this.PUB); }
  create(dto: EcoleDto): Observable<EcoleDto> { return this.http.post<EcoleDto>(this.API, dto); }
  update(code: string, dto: EcoleDto): Observable<EcoleDto> { return this.http.put<EcoleDto>(`${this.API}/${code}`, dto); }
  desactiver(code: string): Observable<void> { return this.http.patch<void>(`${this.API}/${code}/desactiver`, {}); }
  activer(code: string): Observable<void> { return this.http.patch<void>(`${this.API}/${code}/activer`, {}); }
  delete(code: string): Observable<void> { return this.http.delete<void>(`${this.API}/${code}`); }
}
