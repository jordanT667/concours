import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';

import { StatutCandidat } from '../../core/models/candidat.models';
import { CandidatsService, CandidatDto } from '../../core/services/candidats';
import { AppState, DataState } from '../../core/models/app-state.models';
import { CandidatsSkeleton } from './candidats-skeleton/candidats-skeleton';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, FormsModule, CandidatsSkeleton],
  templateUrl: './candidats.html',
  styleUrl: './candidats.css',
})
export class Candidats implements OnInit {

  readonly DataState = DataState;

  candidatsState$!: Observable<AppState<CandidatDto[]>>;

  // Données locales pour le filtrage (alimentées depuis l'observable)
  private tousLesCandidats: CandidatDto[] = [];
  candidatsFiltres: CandidatDto[] = [];
  recherche    = '';
  filtreStatut = 'TOUS';

  statuts: StatutCandidat[] = [
    'EN_ATTENTE', 'VALIDE', 'REJETE', 'ADMIS', 'NON_ADMIS'
  ];

  constructor(
    private router: Router,
    private candidatsService: CandidatsService
  ) {}

  ngOnInit(): void {
    this.chargerCandidats();
  }

  chargerCandidats(): void {
    this.candidatsState$ = this.candidatsService.getAll().pipe(
      map(data => {
        this.tousLesCandidats = data;
        this.candidatsFiltres = data;
        return { dataState: DataState.LOADED, data };
      }),
      startWith({ dataState: DataState.LOADING }),
      catchError(() => of({
        dataState: DataState.ERROR,
        error: 'Impossible de charger la liste des candidats.'
      }))
    );
  }

  appliquerFiltres(): void {
    this.candidatsFiltres = this.tousLesCandidats.filter(c => {
      const matchStatut    = this.filtreStatut === 'TOUS' || c.statut === this.filtreStatut;
      const matchRecherche = this.recherche === ''
        || `${c.nom} ${c.prenom}`.toLowerCase().includes(this.recherche.toLowerCase())
        || c.email.toLowerCase().includes(this.recherche.toLowerCase())
        || c.numeroCNI.includes(this.recherche);
      return matchStatut && matchRecherche;
    });
  }

  voirDetail(id: number): void {
    this.router.navigate(['/admin/candidats', id]);
  }

  couleurStatut(statut: StatutCandidat): string {
    const map: Record<StatutCandidat, string> = {
      'EN_ATTENTE': 'badge-orange',
      'VALIDE':     'badge-bleu',
      'REJETE':     'badge-rouge',
      'ADMIS':      'badge-vert',
      'NON_ADMIS':  'badge-gris'
    };
    return map[statut];
  }
}
