import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BanqueDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class BanqueAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/banques`;
  private readonly API = `${environment.apiUrl}/banques`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<BanqueDto[]> { return this.http.get<BanqueDto[]>(this.PUB); }
  create(dto: BanqueDto): Observable<BanqueDto> { return this.http.post<BanqueDto>(this.API, dto); }
  update(idBanque: string, dto: BanqueDto): Observable<BanqueDto> { return this.http.put<BanqueDto>(`${this.API}/${idBanque}`, dto); }
  desactiver(idBanque: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idBanque}/desactiver`, {}); }
  activer(idBanque: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idBanque}/activer`, {}); }
  delete(idBanque: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idBanque}`); }
}
