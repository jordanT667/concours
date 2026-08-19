import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AdminDataService } from '../services/admin-data.service';
import { PreinscriptionDto } from '../../core/models/preinscription.models';
import { CandidatsSkeleton } from './candidats-skeleton/candidats-skeleton';
import { EtatLibellePipe } from '../../core/pipes/etat-libelle.pipe';
import { EtatCouleurPipe } from '../../core/pipes/etat-couleur.pipe';
import { getAnneeAcademique } from '../../core/utils/annee-academique';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, FormsModule, CandidatsSkeleton, EtatLibellePipe, EtatCouleurPipe],
  templateUrl: './candidats.html',
  styleUrl: './candidats.css',
})
export class Candidats implements OnInit {

  private destroyRef = inject(DestroyRef);

  chargement = true;
  erreur = '';

  private tous: PreinscriptionDto[] = [];
  filtres: PreinscriptionDto[] = [];
  pageItems: PreinscriptionDto[] = [];

  recherche = '';
  filtreEtat = 'TOUS';
  filtrePaiement = 'TOUS';
  vue: 'grille' | 'liste' = 'grille';

  // Pagination
  page = 1;
  pageSize = 24;
  totalPages = 1;

  detailOuvert: PreinscriptionDto | null = null;

  readonly anneeAcademique = getAnneeAcademique();

  constructor(private adminData: AdminDataService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(force = false): void {
    this.chargement = true;
    this.erreur = '';
    this.adminData.getAll(this.anneeAcademique, force)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.tous = list;
          this.appliquerFiltres();
          this.chargement = false;
        },
        error: () => {
          this.erreur = 'Impossible de charger les candidats.';
          this.chargement = false;
        }
      });
  }

  appliquerFiltres(): void {
    let result = [...this.tous];

    if (this.filtreEtat !== 'TOUS') {
      result = result.filter(p => p.etatPreins === this.filtreEtat);
    }
    if (this.filtrePaiement !== 'TOUS') {
      const paye = this.filtrePaiement === 'PAYE';
      result = result.filter(p => p.paye === paye);
    }
    if (this.recherche.trim()) {
      const q = this.recherche.toLowerCase().trim();
      result = result.filter(p =>
        p.nom?.toLowerCase().includes(q) ||
        p.prenom?.toLowerCase().includes(q) ||
        p.matricule?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.numCni?.toLowerCase().includes(q)
      );
    }

    this.filtres = result;
    this.page = 1;
    this.paginer();
  }

  paginer(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filtres.length / this.pageSize));
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    this.pageItems = this.filtres.slice(start, start + this.pageSize);
  }

  allerPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.paginer();
  }

  get pagesVisibles(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  ouvrirDetail(c: PreinscriptionDto): void {
    this.detailOuvert = c;
  }

  fermerDetail(): void {
    this.detailOuvert = null;
  }
}
