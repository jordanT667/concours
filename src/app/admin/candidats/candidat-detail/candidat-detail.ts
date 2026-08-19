import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AdminDataService } from '../../services/admin-data.service';
import { PreinscriptionDto } from '../../../core/models/preinscription.models';
import { EtatLibellePipe } from '../../../core/pipes/etat-libelle.pipe';
import { EtatCouleurPipe } from '../../../core/pipes/etat-couleur.pipe';
import { getAnneeAcademique } from '../../../core/utils/annee-academique';

@Component({
  selector: 'app-candidat-detail',
  standalone: true,
  imports: [CommonModule, EtatLibellePipe, EtatCouleurPipe],
  templateUrl: './candidat-detail.html',
  styleUrl: './candidat-detail.css'
})
export class CandidatDetail implements OnInit {

  private destroyRef = inject(DestroyRef);

  candidat: PreinscriptionDto | null = null;
  chargement = true;
  erreur = '';
  private currentId = 0;

  readonly anneeAcademique = getAnneeAcademique();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminData: AdminDataService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/admin/candidats']);
      return;
    }
    this.currentId = id;
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.erreur = '';
    this.adminData.getById(this.currentId, this.anneeAcademique)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (found) => {
          this.candidat = found ?? null;
          if (!this.candidat) this.erreur = 'Candidat introuvable.';
          this.chargement = false;
        },
        error: () => {
          this.erreur = 'Impossible de charger ce candidat.';
          this.chargement = false;
        }
      });
  }

  retour(): void {
    this.router.navigate(['/admin/candidats']);
  }
}
