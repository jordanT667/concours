import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WelcomeBanner }
  from '../../admin/welcome-banner/welcome-banner';
import { StatsOverview }
  from '../../admin/stats-overview/stats-overview';
import { InscriptionsRecentes }
  from '../../admin/inscriptions-recentes/inscriptions-recentes';
import { RepartitionCentres }
  from '../../admin/repartition-centre/repartition-centre';
import { DashboardStats }
  from '../../core/models/api-response.models';
import { Inscription }
  from '../../core/models/inscription.models';

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

  // Données admin connecté
  nomAdmin = '';
  prenomAdmin = '';

  // Statistiques globales
  stats: DashboardStats = {
    totalInscrits: 0,
    totalValides: 0,
    totalEnAttente: 0,
    totalRejetes: 0,
    tauxValidation: 0,
    parCentre: [],
    parFiliere: [],
  };

  // 5 dernières inscriptions
  inscriptionsRecentes: Inscription[] = [];

  isLoading = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.chargerAdmin();
    this.chargerDashboard();
  }

  chargerAdmin(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.nomAdmin = user.nom;
      this.prenomAdmin = user.prenom;
    }
  }

  chargerDashboard(): void {
    this.isLoading = true;
    // TODO: remplacer par les vrais services
    // this.inscriptionService.getStats().subscribe(stats => {
    //   this.stats = stats;
    // });
    // this.inscriptionService.getRecentes(5).subscribe(list => {
    //   this.inscriptionsRecentes = list;
    // });

    // Données fictives pour tester l'affichage
    this.stats = {
      totalInscrits: 247,
      totalValides: 180,
      totalEnAttente: 42,
      totalRejetes: 25,
      tauxValidation: 73,
      parCentre: [
        { centre: 'Yaoundé', nombre: 68 },
        { centre: 'Douala', nombre: 54 },
        { centre: 'Bertoua', nombre: 31 },
        { centre: 'Bafoussam', nombre: 28 },
        { centre: 'Bamenda', nombre: 22 },
        { centre: 'Garoua', nombre: 18 },
        { centre: 'Ngaoundéré', nombre: 14 },
        { centre: 'Buea', nombre: 12 },
      ],
      parFiliere: [
        { filiere: 'Mécatronique', nombre: 42 },
        { filiere: 'Génie Minier', nombre: 38 },
        { filiere: 'Maîtrise Énergétique', nombre: 35 },
        { filiere: 'Topographie', nombre: 30 },
        { filiere: 'Production Mécanique', nombre: 28 },
        { filiere: 'Logistique Minière', nombre: 25 },
      ],
    };
    this.isLoading = false;
  }

  // Navigation rapide depuis le dashboard
  allerInscriptions(): void {
    this.router.navigate(['/admin/inscriptions']);
  }

  allerCandidats(): void {
    this.router.navigate(['/admin/candidats']);
  }
}