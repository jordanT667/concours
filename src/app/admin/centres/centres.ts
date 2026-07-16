import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentreExamenDto } from '../../core/models/referentiel.models';
import { CentreService } from '../../core/services/centre.service';
import { CentreForm } from '../centre-form/centre-form';

@Component({
  selector: 'app-centres',
  standalone: true,
  imports: [CommonModule, FormsModule, CentreForm],
  templateUrl: './centres.html',
  styleUrl: './centres.css'
})
export class Centres implements OnInit {

  centres: CentreExamenDto[] = [];
  centresFiltres: CentreExamenDto[] = [];
  recherche = '';
  isLoading = false;
  formulaireOuvert = false;
  centreSelectionne: CentreExamenDto | null = null;

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
      }
    });
  }

  supprimer(idCexam: string): void {
    if (!confirm('Confirmer la suppression de ce centre ?')) return;
    this.centreService.delete(idCexam).subscribe({
      next: () => this.charger()
    });
  }
}
