import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CentreExamenDto } from '../../core/models/referentiel.models';
import { CentreService } from '../../core/services/centre.service';
import { CentreForm } from '../centre-form/centre-form';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-centres',
  standalone: true,
  imports: [CommonModule, FormsModule, CentreForm, ConfirmDialog],
  templateUrl: './centres.html',
  styleUrl: './centres.css'
})
export class Centres implements OnInit {

  private destroyRef = inject(DestroyRef);
  confirmOuverte = false;
  private confirmId = '';

  centres: CentreExamenDto[] = [];
  centresFiltres: CentreExamenDto[] = [];
  recherche = '';
  isLoading = false;
  formulaireOuvert = false;
  centreSelectionne: CentreExamenDto | null = null;
  erreur = '';

  constructor(private centreService: CentreService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.isLoading = true;
    this.centreService.getAll().subscribe({
      next: data => {
        this.centres = data;
        this.appliquerFiltres();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  appliquerFiltres(): void {
    this.centresFiltres = this.centres.filter(c => {
      return this.recherche === ''
        || c.libeleFiliereFr.toLowerCase().includes(this.recherche.toLowerCase())
        || c.idCexam.toLowerCase().includes(this.recherche.toLowerCase());
    });
  }

  ouvrirFormulaire(centre?: CentreExamenDto): void {
    this.centreSelectionne = centre ?? null;
    this.formulaireOuvert = true;
  }

  fermerFormulaire(): void {
    this.formulaireOuvert = false;
    this.centreSelectionne = null;
  }

  sauvegarder(centre: CentreExamenDto): void {
    const op$ = this.centreSelectionne
      ? this.centreService.update(centre.idCexam, centre)
      : this.centreService.create(centre);

    op$.subscribe({
      next: () => {
        this.fermerFormulaire();
        this.charger();
      },
      error: (err) => { this.erreur = err?.message ?? 'Erreur lors de l\'enregistrement.'; }
    });
  }

  supprimer(idCexam: string): void {
    this.confirmId = idCexam;
    this.confirmOuverte = true;
  }

  onConfirmerSuppression(): void {
    this.confirmOuverte = false;
    this.centreService.delete(this.confirmId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.charger(),
        error: (err) => { this.erreur = err?.message ?? 'Suppression impossible.'; }
      });
  }

  onAnnulerSuppression(): void {
    this.confirmOuverte = false;
  }
}
