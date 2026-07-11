import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';

import { WelcomeBanner } from '../../admin/welcome-banner/welcome-banner';
import { StatsOverview } from '../../admin/stats-overview/stats-overview';
import { InscriptionsRecentes } from '../../admin/inscriptions-recentes/inscriptions-recentes';
import { RepartitionCentres } from '../../admin/repartition-centre/repartition-centre';
import { RepartitionFilieres } from '../../admin/repartition-filieres/repartition-filieres';
import { DashboardSkeleton } from './dashboard-skeleton/dashboard-skeleton';

import { DashboardStats } from '../../core/models/api-response.models';
import { DashboardService } from '../../core/services/dashboard';
import { AppState, DataState } from '../../core/models/app-state.models';

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
    RepartitionFilieres,
    DashboardSkeleton,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  readonly DataState = DataState;

  nomAdmin   = '';
  prenomAdmin = '';

  dashboardState$!: Observable<AppState<DashboardStats>>;

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
        this.nomAdmin   = user.nom ?? user.username ?? '';
        this.prenomAdmin = user.prenom ?? '';
      } catch (e) {}
    }
  }

  chargerDashboard(): void {
    this.dashboardState$ = this.dashboardService.getStats().pipe(
      map(data  => ({ dataState: DataState.LOADED, data })),
      startWith({ dataState: DataState.LOADING }),
      catchError(() => of({
        dataState: DataState.ERROR,
        error: 'Impossible de charger les statistiques.'
      }))
    );
  }

  allerInscriptions(): void { this.router.navigate(['/admin/inscriptions']); }
  allerCandidats(): void    { this.router.navigate(['/admin/candidats']); }
}
