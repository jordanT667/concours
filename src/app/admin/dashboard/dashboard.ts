import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WelcomeBanner } from '../../admin/welcome-banner/welcome-banner';
import { StatsOverview } from '../../admin/stats-overview/stats-overview';
import { InscriptionsRecentes } from '../../admin/inscriptions-recentes/inscriptions-recentes';
import { RepartitionCentres } from '../../admin/repartition-centre/repartition-centre';
import { DashboardStats } from '../../core/models/api-response.models';
import { DashboardService } from '../../core/services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    WelcomeBanner,
    StatsOverview,
    InscriptionsRecentes,
    RepartitionCentres,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  nomAdmin = '';
  prenomAdmin = '';

  stats: DashboardStats = {
    totalInscrits: 0,
    totalValides: 0,
    totalEnAttente: 0,
    totalRejetes: 0,
    tauxValidation: 0,
    parCentre: [],
    parFiliere: [],
  };

  isLoading = false;
  erreur = '';

  constructor(
    private router: Router,
    private dashboardService: DashboardService
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

  chargerDashboard(): void {
    this.isLoading = true;
    this.erreur = '';
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement dashboard', err);
        this.erreur = 'Impossible de charger les statistiques.';
        this.isLoading = false;
      }
    });
  }

  allerInscriptions(): void {
    this.router.navigate(['/admin/inscriptions']);
  }

  allerCandidats(): void {
    this.router.navigate(['/admin/candidats']);
  }
}
