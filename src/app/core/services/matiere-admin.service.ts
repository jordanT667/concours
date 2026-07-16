import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatiereDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class MatiereAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/matieres`;
  private readonly API = `${environment.apiUrl}/matieres`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<MatiereDto[]> { return this.http.get<MatiereDto[]>(this.PUB); }
  create(dto: MatiereDto): Observable<MatiereDto> { return this.http.post<MatiereDto>(this.API, dto); }
  update(idMatiere: string, dto: MatiereDto): Observable<MatiereDto> { return this.http.put<MatiereDto>(`${this.API}/${idMatiere}`, dto); }
  delete(idMatiere: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idMatiere}`); }
}
