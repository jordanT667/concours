import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DepartementDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class DepartementAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/departements`;
  private readonly API = `${environment.apiUrl}/departements`;
  constructor(private http: HttpClient) {}
  getAll(codeRegion?: string): Observable<DepartementDto[]> {
    let params = new HttpParams();
    if (codeRegion) params = params.set('codeRegion', codeRegion);
    return this.http.get<DepartementDto[]>(this.PUB, { params });
  }
  create(dto: DepartementDto): Observable<DepartementDto> { return this.http.post<DepartementDto>(this.API, dto); }
  update(code: string, dto: DepartementDto): Observable<DepartementDto> { return this.http.put<DepartementDto>(`${this.API}/${code}`, dto); }
  delete(code: string): Observable<void> { return this.http.delete<void>(`${this.API}/${code}`); }
}
