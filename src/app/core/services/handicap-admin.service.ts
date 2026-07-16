import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HandicapDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class HandicapAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/handicaps`;
  private readonly API = `${environment.apiUrl}/handicaps`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<HandicapDto[]> { return this.http.get<HandicapDto[]>(this.PUB); }
  create(dto: HandicapDto): Observable<HandicapDto> { return this.http.post<HandicapDto>(this.API, dto); }
  update(idHandicap: string, dto: HandicapDto): Observable<HandicapDto> { return this.http.put<HandicapDto>(`${this.API}/${idHandicap}`, dto); }
  desactiver(idHandicap: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idHandicap}/desactiver`, {}); }
  activer(idHandicap: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idHandicap}/activer`, {}); }
  delete(idHandicap: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idHandicap}`); }
}
