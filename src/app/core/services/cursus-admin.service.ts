import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CursusDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class CursusAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/cursus`;
  private readonly API = `${environment.apiUrl}/cursus`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<CursusDto[]> { return this.http.get<CursusDto[]>(this.PUB); }
  create(dto: CursusDto): Observable<CursusDto> { return this.http.post<CursusDto>(this.API, dto); }
  update(id: string, dto: CursusDto): Observable<CursusDto> { return this.http.put<CursusDto>(`${this.API}/${id}`, dto); }
  desactiver(id: string): Observable<void> { return this.http.patch<void>(`${this.API}/${id}/desactiver`, {}); }
  activer(id: string): Observable<void> { return this.http.patch<void>(`${this.API}/${id}/activer`, {}); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.API}/${id}`); }
}
