import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DiplomeDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class DiplomeAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/alldiplomes`;
  private readonly API = `${environment.apiUrl}/diplomes`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<DiplomeDto[]> {
    return this.http.get<DiplomeDto[]>(this.PUB, { params: new HttpParams().set('onlyActive', 'false') });
  }
  create(dto: DiplomeDto): Observable<DiplomeDto> { return this.http.post<DiplomeDto>(this.API, dto); }
  update(id: string, dto: DiplomeDto): Observable<DiplomeDto> { return this.http.put<DiplomeDto>(`${this.API}/${id}`, dto); }
  desactiver(id: string): Observable<void> { return this.http.patch<void>(`${this.API}/${id}/desactiver`, {}); }
  activer(id: string): Observable<void> { return this.http.patch<void>(`${this.API}/${id}/activer`, {}); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.API}/${id}`); }
}
