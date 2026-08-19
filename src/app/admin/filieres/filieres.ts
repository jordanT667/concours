import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FiliereDto } from '../../core/models/filiere.models';
import { FiliereFormComponent } from '../filiere-form/filiere-form';
import { FiliereService } from '../../core/services/filiere';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-filieres',
  standalone: true,
  imports: [CommonModule, FormsModule, FiliereFormComponent, ConfirmDialog],
  templateUrl: './filieres.html',
  styleUrl: './filieres.css'
})
export class Filieres implements OnInit {

  private destroyRef = inject(DestroyRef);
  confirmOuverte = false;
  private confirmCode = '';

  filieres: FiliereDto[] = [];
  filieresFiltrees: FiliereDto[] = [];
  recherche = '';
  isLoading = false;
  erreur = '';
  formulaireOuvert = false;
  filiereSelectionnee: FiliereDto | null = null;

  constructor(private filiereService: FiliereService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.isLoading = true;
    this.erreur = '';
    this.filiereService.getAll().subscribe({
      next: (data) => {
        this.filieres = data;
        this.appliquerFiltres();
        this.isLoading = false;
      },
      error: () => {
        this.erreur = 'Impossible de charger les filières.';
        this.isLoading = false;
      }
    });
  }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.filieresFiltrees = this.filieres.filter(f =>
      !q
      || f.codeFiliere.toLowerCase().includes(q)
      || (f.libelleFiliereFr ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirFormulaire(f?: FiliereDto): void {
    this.filiereSelectionnee = f ?? null;
    this.formulaireOuvert = true;
  }

  fermerFormulaire(): void {
    this.formulaireOuvert = false;
    this.filiereSelectionnee = null;
  }

  sauvegarder(f: FiliereDto): void {
    const op$ = this.filiereSelectionnee
      ? this.filiereService.update(f.codeFiliere, f)
      : this.filiereService.create(f);

    op$.subscribe({
      next: () => {
        this.fermerFormulaire();
        this.charger();
      },
      error: () => { this.erreur = 'Erreur lors de la sauvegarde.'; }
    });
  }

  supprimer(codeFiliere: string): void {
    this.confirmCode = codeFiliere;
    this.confirmOuverte = true;
  }

  onConfirmerSuppression(): void {
    this.confirmOuverte = false;
    this.filiereService.delete(this.confirmCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.filieres = this.filieres.filter(f => f.codeFiliere !== this.confirmCode);
          this.appliquerFiltres();
        },
        error: () => { this.erreur = 'Erreur lors de la suppression.'; }
      });
  }

  onAnnulerSuppression(): void {
    this.confirmOuverte = false;
  }
}
