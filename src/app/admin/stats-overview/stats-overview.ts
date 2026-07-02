import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../core/models/api-response.models';

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-overview.html',
  styleUrl: './stats-overview.css'
})
export class StatsOverview {

  @Input() stats!: DashboardStats;

  // Configuration des 4 cartes
  get cartes() {
    return [
      {
        valeur: this.stats.totalInscrits.toString(),
        label: 'Total inscrits',
        couleur: 'bleu',
        icone: '',
        evolution: '+12 cette semaine'
      },
      {
        valeur: this.stats.totalValides.toString(),
        label: 'Dossiers validés',
        couleur: 'vert',
        icone: '',
        evolution: `${this.stats.tauxValidation}% de validation`
      },
      {
        valeur: this.stats.totalEnAttente.toString(),
        label: 'En attente',
        couleur: 'orange',

        evolution: 'À traiter'
      },
      {
        valeur: this.stats.totalRejetes.toString(),
        label: 'Dossiers rejetés',
        couleur: 'rouge',

        evolution: 'Notifiés par SMS'
      },
    ];
  }
}