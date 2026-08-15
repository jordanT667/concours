import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { WelcomeBanner } from '../welcome-banner/welcome-banner';
import { StatsOverview } from '../stats-overview/stats-overview';
import { RepartitionCentres } from '../repartition-centre/repartition-centre';
import { RepartitionFilieres } from '../repartition-filieres/repartition-filieres';
import { DashboardSkeleton } from './dashboard-skeleton/dashboard-skeleton';

import { DashboardStats } from '../../core/models/api-response.models';
import { AdminDataService } from '../services/admin-data.service';
import { PreinscriptionDto } from '../../core/models/preinscription.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    WelcomeBanner,
    StatsOverview,
    RepartitionCentres,
    RepartitionFilieres,
    DashboardSkeleton,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  nomAdmin = '';
  prenomAdmin = '';

  chargement = true;
  erreur = '';

  stats: DashboardStats | null = null;
  recentes: PreinscriptionDto[] = [];
  totalPayes = 0;
  totalNonPayes = 0;
  tauxPaiement = 0;

  constructor(
    private router: Router,
    private adminData: AdminDataService
  ) {}

  ngOnInit(): void {
    this.chargerAdmin();
    this.chargerDashboard();
  }

  chargerAdmin(): void {
    if (typeof window === 'undefined') return;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.nomAdmin = user.nom ?? user.username ?? '';
        this.prenomAdmin = user.prenom ?? '';
      } catch (e) {}
    }
  }

  get anneeAcademique(): string {
    const y = new Date().getFullYear();
    const m = new Date().getMonth();
    const start = m >= 7 ? y : y - 1;
    return `${start}/${start + 1}`;
  }

  chargerDashboard(force = false): void {
    this.chargement = true;
    this.erreur = '';

    this.adminData.getAll(this.anneeAcademique, force).subscribe({
      next: (list) => {
        this.stats = this.computeStats(list);
        this.recentes = list
          .sort((a, b) => (b.idPreins ?? 0) - (a.idPreins ?? 0))
          .slice(0, 5);

        this.totalPayes = list.filter(p => p.paye).length;
        this.totalNonPayes = list.filter(p => !p.paye).length;
        this.tauxPaiement = list.length > 0 ? Math.round((this.totalPayes / list.length) * 100) : 0;

        this.chargement = false;
      },
      error: () => {
        this.erreur = 'Impossible de charger les statistiques.';
        this.chargement = false;
      }
    });
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
    const parCentre = Array.from(centreMap.entries())
      .map(([centre, nombre]) => ({ centre, nombre }));

    const filiereMap = new Map<string, number>();
    for (const p of list) {
      const f = p.choixFormation1 || 'Non renseigné';
      filiereMap.set(f, (filiereMap.get(f) || 0) + 1);
    }
    const parFiliere = Array.from(filiereMap.entries())
      .map(([filiere, nombre]) => ({ filiere, nombre }));

    return { totalInscrits: total, totalValides: valides, totalEnAttente: enAttente, totalRejetes: rejetes, tauxValidation: taux, parCentre, parFiliere };
  }

  etatLibelle(etat?: string): string {
    switch (etat) {
      case 'E': return 'Soumis';
      case 'V': return 'Vérification';
      case 'S': return 'Sélectionné';
      case 'R': return 'Rejeté';
      default: return 'En attente';
    }
  }

  etatCouleur(etat?: string): string {
    switch (etat) {
      case 'S': return 'badge-vert';
      case 'R': return 'badge-rouge';
      case 'V': return 'badge-bleu';
      default: return 'badge-orange';
    }
  }

  allerInscriptions(): void { this.router.navigate(['/admin/inscriptions']); }
  allerCandidats(): void { this.router.navigate(['/admin/candidats']); }
}
