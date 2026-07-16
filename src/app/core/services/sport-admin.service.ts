import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SportDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class SportAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/sports`;
  private readonly API = `${environment.apiUrl}/sports`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<SportDto[]> { return this.http.get<SportDto[]>(this.PUB); }
  create(dto: SportDto): Observable<SportDto> { return this.http.post<SportDto>(this.API, dto); }
  update(idSport: string, dto: SportDto): Observable<SportDto> { return this.http.put<SportDto>(`${this.API}/${idSport}`, dto); }
  desactiver(idSport: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idSport}/desactiver`, {}); }
  activer(idSport: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idSport}/activer`, {}); }
  delete(idSport: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idSport}`); }
}
