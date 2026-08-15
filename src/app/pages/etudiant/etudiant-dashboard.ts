import { Component, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth';
import { PreinscriptionService } from '../../core/services/preinscription.service';
import { PreinscriptionDto } from '../../core/models/preinscription.models';

@Component({
  selector: 'app-etudiant-dashboard',
  standalone: true,
  templateUrl: './etudiant-dashboard.html',
  styleUrl: './etudiant-dashboard.css'
})
export class EtudiantDashboard {

  dossier: PreinscriptionDto | null = null;
  chargement = true;
  erreur = '';

  private auth = inject(AuthService);
  private preinscriptionService = inject(PreinscriptionService);
  private router = inject(Router);

  constructor() {
    afterNextRender(() => this.chargerDossier());
  }

  chargerDossier(): void {
    this.chargement = true;
    this.erreur = '';
    const matricule = this.auth.getUsername();
    if (!matricule) {
      this.router.navigate(['/login']);
      return;
    }
    this.preinscriptionService.getByMatricule(matricule).subscribe({
      next: (data) => {
        this.dossier = data;
        this.chargement = false;
      },
      error: (err) => {
        if (err?.status === 403 || err?.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.erreur = 'Impossible de charger votre dossier.';
          this.chargement = false;
        }
      }
    });
  }

  deconnexion(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
