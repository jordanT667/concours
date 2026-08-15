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

  get cartes() {
    return [
      {
        valeur: this.stats.totalInscrits.toString(),
        label: 'Total inscrits',
        couleur: 'bleu',
        evolution: `${this.stats.tauxValidation}% traités`
      },
      {
        valeur: this.stats.totalValides.toString(),
        label: 'Sélectionnés',
        couleur: 'vert',
        evolution: this.stats.totalInscrits > 0
          ? `${Math.round((this.stats.totalValides / this.stats.totalInscrits) * 100)}% du total`
          : '—'
      },
      {
        valeur: this.stats.totalEnAttente.toString(),
        label: 'En attente',
        couleur: 'orange',
        evolution: 'À traiter'
      },
      {
        valeur: this.stats.totalRejetes.toString(),
        label: 'Rejetés',
        couleur: 'rouge',
        evolution: this.stats.totalInscrits > 0
          ? `${Math.round((this.stats.totalRejetes / this.stats.totalInscrits) * 100)}% du total`
          : '—'
      },
    ];
  }
}
