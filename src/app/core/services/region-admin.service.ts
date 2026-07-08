import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegionDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class RegionAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/regions`;
  private readonly API = `${environment.apiUrl}/region/regions`;
  constructor(private http: HttpClient) {}
  getAll(codePays = 'CMR'): Observable<RegionDto[]> {
    return this.http.get<RegionDto[]>(this.PUB, { params: new HttpParams().set('codePays', codePays) });
  }
  create(dto: RegionDto): Observable<RegionDto> { return this.http.post<RegionDto>(this.API, dto); }
  update(code: string, dto: RegionDto): Observable<RegionDto> { return this.http.put<RegionDto>(`${this.API}/${code}`, dto); }
  delete(code: string): Observable<void> { return this.http.delete<void>(`${this.API}/${code}`); }
}
