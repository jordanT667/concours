import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoisirDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class LoisirAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/loisirs`;
  private readonly API = `${environment.apiUrl}/loisirs`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<LoisirDto[]> { return this.http.get<LoisirDto[]>(this.PUB); }
  create(dto: LoisirDto): Observable<LoisirDto> { return this.http.post<LoisirDto>(this.API, dto); }
  update(idLoisir: string, dto: LoisirDto): Observable<LoisirDto> { return this.http.put<LoisirDto>(`${this.API}/${idLoisir}`, dto); }
  desactiver(idLoisir: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idLoisir}/desactiver`, {}); }
  activer(idLoisir: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idLoisir}/activer`, {}); }
  delete(idLoisir: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idLoisir}`); }
}
