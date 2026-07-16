import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';

import { Inscription, StatutInscription } from '../../core/models/inscription.models';
import { InscriptionService } from '../../core/services/inscription';
import { AuthService } from '../../auth/auth';
import { AppState, DataState } from '../../core/models/app-state.models';
import { InscriptionsSkeleton } from './inscriptions-skeleton/inscriptions-skeleton';

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, InscriptionsSkeleton],
  templateUrl: './inscriptions.html',
  styleUrl: './inscriptions.css'
})
export class Inscriptions implements OnInit {

  readonly DataState = DataState;

  inscriptionsState$!: Observable<AppState<Inscription[]>>;

  // Données locales pour le filtrage et les actions
  private toutesLesInscriptions: Inscription[] = [];
  inscriptionsFiltrees: Inscription[] = [];
  erreurAction = '';

  filtreStatut = 'TOUS';
  filtreCentre = 'TOUS';
  recherche    = '';

  centres = [
    'Bafoussam', 'Bamenda', 'Batouri', 'Bertoua',
    'Buea', 'Douala', 'Ebolowa', 'Garoua',
    'Maroua', 'Ngaoundéré', 'Yaoundé'
  ];

  statuts: StatutInscription[] = [
    'SOUMISE', 'EN_COURS_VERIFICATION', 'VALIDEE', 'REJETEE'
  ];

  constructor(
    private router: Router,
    private inscriptionService: InscriptionService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerInscriptions();
  }

  chargerInscriptions(): void {
    this.erreurAction = '';
    this.inscriptionsState$ = this.inscriptionService.getAll().pipe(
      map(data => {
        this.toutesLesInscriptions = data;
        this.appliquerFiltres();
        return { dataState: DataState.LOADED, data };
      }),
      startWith({ dataState: DataState.LOADING }),
      catchError(() => of({
        dataState: DataState.ERROR,
        error: 'Impossible de charger les inscriptions.'
      }))
    );
  }

  appliquerFiltres(): void {
    this.inscriptionsFiltrees = this.toutesLesInscriptions.filter(ins => {
      const matchStatut    = this.filtreStatut === 'TOUS' || ins.statut === this.filtreStatut;
      const matchCentre    = this.filtreCentre === 'TOUS' || ins.centreExamen?.libeleFiliereFr === this.filtreCentre;
      const matchRecherche = this.recherche === ''
        || ins.candidat?.nom?.toLowerCase().includes(this.recherche.toLowerCase())
        || ins.candidat?.prenom?.toLowerCase().includes(this.recherche.toLowerCase())
        || ins.numeroRecu?.includes(this.recherche);
      return matchStatut && matchCentre && matchRecherche;
    });
  }

  voirDetail(id: number): void {
    this.router.navigate(['/admin/inscriptions', id]);
  }

  valider(id: number, event: Event): void {
    event.stopPropagation();
    this.inscriptionService.updateStatut(id, { statut: 'VALIDEE' }).subscribe({
      next: updated => {
        const idx = this.toutesLesInscriptions.findIndex(i => i.id === id);
        if (idx !== -1) this.toutesLesInscriptions[idx] = updated;
        this.appliquerFiltres();
      },
      error: () => { this.erreurAction = 'Erreur lors de la validation.'; }
    });
  }

  rejeter(id: number, event: Event): void {
    event.stopPropagation();
    this.inscriptionService.updateStatut(id, { statut: 'REJETEE' }).subscribe({
      next: updated => {
        const idx = this.toutesLesInscriptions.findIndex(i => i.id === id);
        if (idx !== -1) this.toutesLesInscriptions[idx] = updated;
        this.appliquerFiltres();
      },
      error: () => { this.erreurAction = 'Erreur lors du rejet.'; }
    });
  }

  exporterCSV(): void {
    if (this.inscriptionsFiltrees.length === 0) return;
    const entetes = ['N° Reçu', 'Nom', 'Prénom', 'Centre', 'Statut', 'Date'];
    const lignes = this.inscriptionsFiltrees.map(i => [
      i.numeroRecu,
      i.candidat?.nom ?? '',
      i.candidat?.prenom ?? '',
      i.centreExamen?.libeleFiliereFr ?? '',
      this.libelleStatut(i.statut),
      i.dateInscription ? new Date(i.dateInscription).toLocaleDateString('fr-FR') : ''
    ]);
    const csv = [entetes, ...lignes].map(row => row.map(v => `"${v}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscriptions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  couleurStatut(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      'SOUMISE':               'badge-orange',
      'EN_COURS_VERIFICATION': 'badge-bleu',
      'VALIDEE':               'badge-vert',
      'REJETEE':               'badge-rouge'
    };
    return map[statut];
  }

  libelleStatut(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      'SOUMISE':               'Soumise',
      'EN_COURS_VERIFICATION': 'En vérification',
      'VALIDEE':               'Validée',
      'REJETEE':               'Rejetée'
    };
    return map[statut];
  }
}
