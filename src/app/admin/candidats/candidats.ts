import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminDataService } from '../services/admin-data.service';
import { PreinscriptionDto } from '../../core/models/preinscription.models';
import { CandidatsSkeleton } from './candidats-skeleton/candidats-skeleton';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, FormsModule, CandidatsSkeleton],
  templateUrl: './candidats.html',
  styleUrl: './candidats.css',
})
export class Candidats implements OnInit {

  chargement = true;
  erreur = '';

  private tous: PreinscriptionDto[] = [];
  filtres: PreinscriptionDto[] = [];

  recherche = '';
  filtreEtat = 'TOUS';
  filtrePaiement = 'TOUS';
  vue: 'grille' | 'liste' = 'grille';

  detailOuvert: PreinscriptionDto | null = null;

  constructor(private adminData: AdminDataService) {}

  ngOnInit(): void {
    this.charger();
  }

  get anneeAcademique(): string {
    const y = new Date().getFullYear();
    const m = new Date().getMonth();
    const start = m >= 7 ? y : y - 1;
    return `${start}/${start + 1}`;
  }

  charger(force = false): void {
    this.chargement = true;
    this.erreur = '';
    this.adminData.getAll(this.anneeAcademique, force).subscribe({
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
  }

  ouvrirDetail(c: PreinscriptionDto): void {
    this.detailOuvert = c;
  }

  fermerDetail(): void {
    this.detailOuvert = null;
  }

  etatLibelle(etat?: string): string {
    switch (etat) {
      case 'E': return 'Soumis';
      case 'V': return 'Vérification';
      case 'S': return 'Sélectionné';
      case 'R': return 'Rejeté';
      default: return '—';
    }
  }

  etatCouleur(etat?: string): string {
    switch (etat) {
      case 'S': return 'badge-vert';
      case 'R': return 'badge-rouge';
      case 'V': return 'badge-bleu';
      default: return 'badge-orange';
    }
  }
}
