import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SiteDepotDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class SiteDepotAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/sites-depot`;
  private readonly API = `${environment.apiUrl}/sites-depot`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<SiteDepotDto[]> { return this.http.get<SiteDepotDto[]>(this.PUB); }
  create(dto: SiteDepotDto): Observable<SiteDepotDto> { return this.http.post<SiteDepotDto>(this.API, dto); }
  update(idSiteDepot: string, dto: SiteDepotDto): Observable<SiteDepotDto> { return this.http.put<SiteDepotDto>(`${this.API}/${idSiteDepot}`, dto); }
  delete(idSiteDepot: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idSiteDepot}`); }
}
