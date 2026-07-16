import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CentreExamenDto } from '../models/referentiel.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CentreService {
  private readonly API = `${environment.apiUrl}/centres-examen`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CentreExamenDto[]> {
    return this.http.get<CentreExamenDto[]>(this.API);
  }

  create(centre: CentreExamenDto): Observable<CentreExamenDto> {
    return this.http.post<CentreExamenDto>(this.API, centre);
  }

  update(idCexam: string, centre: CentreExamenDto): Observable<CentreExamenDto> {
    return this.http.put<CentreExamenDto>(`${this.API}/${idCexam}`, centre);
  }

  delete(idCexam: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${idCexam}`);
  }
}
