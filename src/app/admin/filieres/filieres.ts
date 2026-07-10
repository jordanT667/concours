import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiliereDto } from '../../core/models/filiere.models';
import { FiliereFormComponent } from '../filiere-form/filiere-form';
import { FiliereService } from '../../core/services/filiere';

@Component({
  selector: 'app-filieres',
  standalone: true,
  imports: [CommonModule, FormsModule, FiliereFormComponent],
  templateUrl: './filieres.html',
  styleUrl: './filieres.css'
})
export class Filieres implements OnInit {

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
    if (!confirm('Supprimer cette filière ?')) return;
    this.filiereService.delete(codeFiliere).subscribe({
      next: () => {
        this.filieres = this.filieres.filter(f => f.codeFiliere !== codeFiliere);
        this.appliquerFiltres();
      },
      error: () => { this.erreur = 'Erreur lors de la suppression.'; }
    });
  }
}
