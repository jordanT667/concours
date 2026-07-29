import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PreinscriptionDto } from '../models/preinscription.models';

@Injectable({ providedIn: 'root' })
export class PreinscriptionService {
  private readonly PUB = `${environment.apiUrl}/concours/preinscriptions`;
  private readonly API = `${environment.apiUrl}/preinscriptions`;

  constructor(private http: HttpClient) {}

  create(dto: PreinscriptionDto): Observable<PreinscriptionDto> {
    return this.http.post<PreinscriptionDto>(this.PUB, dto);
  }

  getByMatricule(matricule: string): Observable<PreinscriptionDto> {
    return this.http.get<PreinscriptionDto>(`${this.API}/matricule/${matricule}`);
  }

  getAll(annee?: string): Observable<PreinscriptionDto[]> {
    let params = new HttpParams();
    if (annee) params = params.set('annee', annee);
    return this.http.get<PreinscriptionDto[]>(this.API, { params });
  }

  search(filters: {
    nom?: string; prenom?: string; email?: string; matricule?: string;
    diplome?: string; centre?: string; etat?: string; annuler?: boolean;
  }): Observable<PreinscriptionDto[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<PreinscriptionDto[]>(`${this.API}/search`, { params });
  }

  getByDiplome(diplome: string): Observable<PreinscriptionDto[]> {
    return this.http.get<PreinscriptionDto[]>(`${this.API}/diplome/${diplome}`);
  }

  getByCentre(centre: string): Observable<PreinscriptionDto[]> {
    return this.http.get<PreinscriptionDto[]>(`${this.API}/centre/${centre}`);
  }

  getByDateRange(dateDebut: string, dateFin: string): Observable<PreinscriptionDto[]> {
    return this.http.get<PreinscriptionDto[]>(`${this.API}/dates`, { params: { dateDebut, dateFin } });
  }

  update(id: number, dto: PreinscriptionDto): Observable<PreinscriptionDto> {
    return this.http.put<PreinscriptionDto>(`${this.API}/${id}`, dto);
  }

  annuler(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/annuler`, {});
  }

  reactiver(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/reactiver`, {});
  }

  updateEtat(id: number, etat: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/etat`, {}, { params: { etat } });
  }

  updatePaiement(id: number, paye: boolean, datePaiement?: string, typePaiement?: string): Observable<void> {
    let params = new HttpParams().set('paye', String(paye));
    if (datePaiement) params = params.set('datePaiement', datePaiement);
    if (typePaiement) params = params.set('typePaiement', typePaiement);
    return this.http.patch<void>(`${this.API}/${id}/paiement`, {}, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
