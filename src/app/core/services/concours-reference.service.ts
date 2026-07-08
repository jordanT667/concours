import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaysDto } from '../models/pays.models';
import {
  CursusDto, NiveauDto, FiliereDto, DiplomeDto,
  RegionDto, DepartementDto, LangueDto
} from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class ConcoursReferenceService {
  private readonly BASE = `${environment.apiUrl}/concours`;

  constructor(private http: HttpClient) {}

  getPays(): Observable<PaysDto[]> {
    return this.http.get<PaysDto[]>(`${this.BASE}/pays`);
  }

  getLangues(): Observable<LangueDto[]> {
    return this.http.get<LangueDto[]>(`${this.BASE}/langues`);
  }

  getRegions(codePays = 'CMR'): Observable<RegionDto[]> {
    const params = new HttpParams().set('codePays', codePays);
    return this.http.get<RegionDto[]>(`${this.BASE}/regions`, { params });
  }

  getDepartements(codeRegion: string): Observable<DepartementDto[]> {
    const params = new HttpParams().set('codeRegion', codeRegion);
    return this.http.get<DepartementDto[]>(`${this.BASE}/departements`, { params });
  }

  getCursus(): Observable<CursusDto[]> {
    return this.http.get<CursusDto[]>(`${this.BASE}/cursus`);
  }

  getNiveaux(): Observable<NiveauDto[]> {
    return this.http.get<NiveauDto[]>(`${this.BASE}/niveaux`);
  }

  getDiplomes(idCursus = '*', codeNiveau = '*'): Observable<DiplomeDto[]> {
    const params = new HttpParams()
      .set('idCursus', idCursus)
      .set('codeNiveau', codeNiveau);
    return this.http.get<DiplomeDto[]>(`${this.BASE}/diplomes`, { params });
  }

  getFilieres(idCursus = '*', codeNiveau = '*'): Observable<FiliereDto[]> {
    const params = new HttpParams()
      .set('idCursus', idCursus)
      .set('codeNiveau', codeNiveau);
    return this.http.get<FiliereDto[]>(`${this.BASE}/searchfiliere`, { params });
  }
}
