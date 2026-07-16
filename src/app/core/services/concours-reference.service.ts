import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaysDto } from '../models/pays.models';
import {
  CursusDto, NiveauDto, FiliereDto, DiplomeDto,
  RegionDto, DepartementDto, LangueDto, EcoleDto,
  SerieDto, BanqueDto, SportDto, LoisirDto, HandicapDto,
  MentionDto, SiteDepotDto, CentreExamenDto, MatiereDto, EpreuveMatiereDto
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

  getEcoles(): Observable<EcoleDto[]> {
    return this.http.get<EcoleDto[]>(`${this.BASE}/ecoles`);
  }

  getSeries(): Observable<SerieDto[]> {
    return this.http.get<SerieDto[]>(`${this.BASE}/series`);
  }

  getSeriesByDiplome(idDiplome: string): Observable<SerieDto[]> {
    return this.http.get<SerieDto[]>(`${this.BASE}/serie/${idDiplome}`);
  }

  getBanques(): Observable<BanqueDto[]> {
    return this.http.get<BanqueDto[]>(`${this.BASE}/banques`);
  }

  getSports(): Observable<SportDto[]> {
    return this.http.get<SportDto[]>(`${this.BASE}/sports`);
  }

  getLoisirs(): Observable<LoisirDto[]> {
    return this.http.get<LoisirDto[]>(`${this.BASE}/loisirs`);
  }

  getHandicaps(): Observable<HandicapDto[]> {
    return this.http.get<HandicapDto[]>(`${this.BASE}/handicaps`);
  }

  getMentions(): Observable<MentionDto[]> {
    return this.http.get<MentionDto[]>(`${this.BASE}/mentions`);
  }

  getSitesDepot(): Observable<SiteDepotDto[]> {
    return this.http.get<SiteDepotDto[]>(`${this.BASE}/sites-depot`);
  }

  getSitesDepotByCursus(idCursus: string): Observable<SiteDepotDto[]> {
    const params = new HttpParams().set('idCursus', idCursus);
    return this.http.get<SiteDepotDto[]>(`${this.BASE}/sites-depot/search`, { params });
  }

  getCentresExamen(): Observable<CentreExamenDto[]> {
    return this.http.get<CentreExamenDto[]>(`${this.BASE}/centres-examen`);
  }

  getCentresExamenByNiveau(codeNiveau: string): Observable<CentreExamenDto[]> {
    const params = new HttpParams().set('codeNiveau', codeNiveau);
    return this.http.get<CentreExamenDto[]>(`${this.BASE}/centres-examen/search`, { params });
  }

  getMatieres(): Observable<MatiereDto[]> {
    return this.http.get<MatiereDto[]>(`${this.BASE}/matieres`);
  }

  getEpreuveMatieres(codefilere: string, idcursus: string, codeNiveau: string, iddiplome: string): Observable<EpreuveMatiereDto[]> {
    const params = new HttpParams()
      .set('codefilere', codefilere)
      .set('idcursus', idcursus)
      .set('codeNiveau', codeNiveau)
      .set('iddiplome', iddiplome);
    return this.http.get<EpreuveMatiereDto[]>(`${this.BASE}/epreuve/matieres`, { params });
  }

  getAnnees(nbAnnees = 15): Observable<number[]> {
    const params = new HttpParams().set('nbAnnees', nbAnnees.toString());
    return this.http.get<number[]>(`${this.BASE}/annees`, { params });
  }
}
