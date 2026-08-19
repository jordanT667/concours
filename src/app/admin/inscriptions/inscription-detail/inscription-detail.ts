import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PreinscriptionService } from '../../../core/services/preinscription.service';
import { AdminDataService } from '../../services/admin-data.service';
import { PreinscriptionDto } from '../../../core/models/preinscription.models';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EtatLibellePipe } from '../../../core/pipes/etat-libelle.pipe';
import { EtatCouleurPipe } from '../../../core/pipes/etat-couleur.pipe';
import { getAnneeAcademique } from '../../../core/utils/annee-academique';

@Component({
  selector: 'app-inscription-detail',
  standalone: true,
  imports: [CommonModule, ConfirmDialog, EtatLibellePipe, EtatCouleurPipe],
  templateUrl: './inscription-detail.html',
  styleUrl: './inscription-detail.css'
})
export class InscriptionDetail implements OnInit {

  private destroyRef = inject(DestroyRef);

  ins: PreinscriptionDto | null = null;
  chargement = true;
  erreur = '';
  private currentId = 0;

  // Confirmation
  confirmOuverte = false;
  confirmTitre = '';
  confirmMessage = '';
  confirmTexteBouton = '';
  confirmClassBouton = 'btn-danger';
  private confirmAction: (() => void) | null = null;

  readonly anneeAcademique = getAnneeAcademique();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private preinscriptionService: PreinscriptionService,
    private adminData: AdminDataService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/admin/inscriptions']);
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
          this.ins = found ?? null;
          if (!this.ins) this.erreur = 'Inscription introuvable.';
          this.chargement = false;
        },
        error: () => {
          this.erreur = 'Impossible de charger cette inscription.';
          this.chargement = false;
        }
      });
  }

  changerEtat(etat: string): void {
    if (!this.ins?.idPreins) return;

    const label = etat === 'S' ? 'Sélectionner' : 'Rejeter';
    const msg = etat === 'S'
      ? `Sélectionner ${this.ins.nom} ${this.ins.prenom} ?`
      : `Rejeter ${this.ins.nom} ${this.ins.prenom} ?`;
    const classe = etat === 'S' ? 'btn-success' : 'btn-danger';

    this.confirmTitre = label;
    this.confirmMessage = msg;
    this.confirmTexteBouton = label;
    this.confirmClassBouton = classe;
    this.confirmAction = () => {
      this.preinscriptionService.updateEtat(this.ins!.idPreins!, etat)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.ins!.etatPreins = etat;
            this.adminData.invalidate();
          },
          error: () => { this.erreur = `Erreur lors du changement d'état.`; }
        });
    };
    this.confirmOuverte = true;
  }

  onConfirmer(): void {
    this.confirmOuverte = false;
    if (this.confirmAction) this.confirmAction();
    this.confirmAction = null;
  }

  onAnnuler(): void {
    this.confirmOuverte = false;
    this.confirmAction = null;
  }

  retour(): void {
    this.router.navigate(['/admin/inscriptions']);
  }
}
