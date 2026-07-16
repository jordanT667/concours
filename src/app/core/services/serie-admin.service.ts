import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SerieDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class SerieAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/series`;
  private readonly API = `${environment.apiUrl}/series`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<SerieDto[]> { return this.http.get<SerieDto[]>(this.PUB); }
  create(dto: SerieDto): Observable<SerieDto> { return this.http.post<SerieDto>(this.API, dto); }
  update(idSerie: string, dto: SerieDto): Observable<SerieDto> { return this.http.put<SerieDto>(`${this.API}/${idSerie}`, dto); }
  desactiver(idSerie: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idSerie}/desactiver`, {}); }
  activer(idSerie: string): Observable<void> { return this.http.patch<void>(`${this.API}/${idSerie}/activer`, {}); }
  delete(idSerie: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idSerie}`); }
  updateDiplomes(idDiplome: string, idsSerie: string[]): Observable<void> { return this.http.put<void>(`${this.API}/${idDiplome}/series`, idsSerie); }
}
