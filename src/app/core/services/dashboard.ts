import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardStats, StatParCentre, StatParFiliere } from '../models/api-response.models';
import { PreinscriptionDto } from '../models/preinscription.models';

export type { DashboardStats };

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = `${environment.apiUrl}/preinscriptions`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<PreinscriptionDto[]>(this.API).pipe(
      map(list => this.computeStats(list))
    );
  }

  private computeStats(list: PreinscriptionDto[]): DashboardStats {
    const total = list.length;
    const valides = list.filter(p => p.etatPreins === 'S').length;
    const enAttente = list.filter(p => p.etatPreins === 'E' || p.etatPreins === 'V').length;
    const rejetes = list.filter(p => p.etatPreins === 'R').length;
    const taux = total > 0 ? Math.round((valides / total) * 100) : 0;

    const centreMap = new Map<string, number>();
    for (const p of list) {
      const c = p.centredexamen || 'Non attribué';
      centreMap.set(c, (centreMap.get(c) || 0) + 1);
    }
    const parCentre: StatParCentre[] = Array.from(centreMap.entries())
      .map(([centre, nombre]) => ({ centre, nombre }));

    const filiereMap = new Map<string, number>();
    for (const p of list) {
      const f = p.choixFormation1 || 'Non renseigné';
      filiereMap.set(f, (filiereMap.get(f) || 0) + 1);
    }
    const parFiliere: StatParFiliere[] = Array.from(filiereMap.entries())
      .map(([filiere, nombre]) => ({ filiere, nombre }));

    return {
      totalInscrits: total,
      totalValides: valides,
      totalEnAttente: enAttente,
      totalRejetes: rejetes,
      tauxValidation: taux,
      parCentre,
      parFiliere
    };
  }
}
