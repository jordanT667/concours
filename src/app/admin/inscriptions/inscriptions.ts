import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PreinscriptionService } from '../../core/services/preinscription.service';
import { AdminDataService } from '../services/admin-data.service';
import { PreinscriptionDto } from '../../core/models/preinscription.models';
import { InscriptionsSkeleton } from './inscriptions-skeleton/inscriptions-skeleton';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EtatLibellePipe } from '../../core/pipes/etat-libelle.pipe';
import { EtatCouleurPipe } from '../../core/pipes/etat-couleur.pipe';
import { getAnneeAcademique } from '../../core/utils/annee-academique';

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, InscriptionsSkeleton, ConfirmDialog, EtatLibellePipe, EtatCouleurPipe],
  templateUrl: './inscriptions.html',
  styleUrl: './inscriptions.css'
})
export class Inscriptions implements OnInit {

  private destroyRef = inject(DestroyRef);

  chargement = true;
  erreur = '';
  erreurAction = '';

  private toutes: PreinscriptionDto[] = [];
  filtrees: PreinscriptionDto[] = [];
  pageItems: PreinscriptionDto[] = [];
  paiementEnCours = new Set<number>();

  recherche = '';
  filtreEtat = 'TOUS';
  filtrePaiement = 'TOUS';
  filtreCentre = 'TOUS';
  triColonne = 'idPreins';
  triAsc = false;

  centres: string[] = [];

  // Pagination
  page = 1;
  pageSize = 25;
  totalPages = 1;

  // Confirmation dialog
  confirmOuverte = false;
  confirmTitre = '';
  confirmMessage = '';
  confirmDetail = '';
  confirmTexteBouton = '';
  confirmClassBouton = 'btn-danger';
  private confirmAction: (() => void) | null = null;

  readonly anneeAcademique = getAnneeAcademique();

  constructor(
    private router: Router,
    private preinscriptionService: PreinscriptionService,
    private adminData: AdminDataService
  ) {}

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
          this.toutes = list;
          this.centres = [...new Set(list.map(p => p.centredexamen).filter(Boolean))] as string[];
          this.appliquerFiltres();
          this.chargement = false;
        },
        error: () => {
          this.erreur = 'Impossible de charger les inscriptions.';
          this.chargement = false;
        }
      });
  }

  appliquerFiltres(): void {
    let result = [...this.toutes];

    if (this.filtreEtat !== 'TOUS') {
      result = result.filter(p => p.etatPreins === this.filtreEtat);
    }
    if (this.filtrePaiement !== 'TOUS') {
      const paye = this.filtrePaiement === 'PAYE';
      result = result.filter(p => p.paye === paye);
    }
    if (this.filtreCentre !== 'TOUS') {
      result = result.filter(p => p.centredexamen === this.filtreCentre);
    }
    if (this.recherche.trim()) {
      const q = this.recherche.toLowerCase().trim();
      result = result.filter(p =>
        p.nom?.toLowerCase().includes(q) ||
        p.prenom?.toLowerCase().includes(q) ||
        p.matricule?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const va = (a as any)[this.triColonne] ?? '';
      const vb = (b as any)[this.triColonne] ?? '';
      const cmp = va > vb ? 1 : va < vb ? -1 : 0;
      return this.triAsc ? cmp : -cmp;
    });

    this.filtrees = result;
    this.page = 1;
    this.paginer();
  }

  paginer(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filtrees.length / this.pageSize));
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    this.pageItems = this.filtrees.slice(start, start + this.pageSize);
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

  trier(col: string): void {
    if (this.triColonne === col) {
      this.triAsc = !this.triAsc;
    } else {
      this.triColonne = col;
      this.triAsc = true;
    }
    this.appliquerFiltres();
  }

  // --- Confirmation dialog ---

  private demanderConfirmation(titre: string, message: string, detail: string, texteBouton: string, classBouton: string, action: () => void): void {
    this.confirmTitre = titre;
    this.confirmMessage = message;
    this.confirmDetail = detail;
    this.confirmTexteBouton = texteBouton;
    this.confirmClassBouton = classBouton;
    this.confirmAction = action;
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

  // --- Actions ---

  changerEtat(ins: PreinscriptionDto, etat: string, event: Event): void {
    event.stopPropagation();
    if (!ins.idPreins) return;

    const label = etat === 'S' ? 'Sélectionner' : 'Rejeter';
    const msg = etat === 'S'
      ? `Sélectionner ${ins.nom} ${ins.prenom} ?`
      : `Rejeter ${ins.nom} ${ins.prenom} ?`;
    const detail = etat === 'R' ? 'Cette action changera le statut du candidat en "Rejeté".' : '';
    const classe = etat === 'S' ? 'btn-success' : 'btn-danger';

    this.demanderConfirmation(label, msg, detail, label, classe, () => {
      this.erreurAction = '';
      this.preinscriptionService.updateEtat(ins.idPreins!, etat)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            ins.etatPreins = etat;
            this.adminData.invalidate();
            this.appliquerFiltres();
          },
          error: () => { this.erreurAction = `Erreur lors du changement d'état.`; }
        });
    });
  }

  togglePaiement(ins: PreinscriptionDto, event: Event): void {
    event.stopPropagation();
    if (!ins.idPreins || this.paiementEnCours.has(ins.idPreins)) return;

    const nouveauStatut = !ins.paye;
    const msg = nouveauStatut
      ? `Marquer ${ins.nom} ${ins.prenom} comme payé ?`
      : `Annuler le paiement de ${ins.nom} ${ins.prenom} ?`;
    const classe = nouveauStatut ? 'btn-success' : 'btn-warning';
    const texte = nouveauStatut ? 'Confirmer paiement' : 'Annuler paiement';

    this.demanderConfirmation('Paiement', msg, '', texte, classe, () => {
      const id = ins.idPreins!;
      const datePaiement = nouveauStatut ? new Date().toISOString().slice(0, 10) : undefined;

      this.paiementEnCours.add(id);
      ins.paye = nouveauStatut;
      ins.datePaiement = datePaiement ?? undefined;

      this.preinscriptionService.updatePaiement(id, nouveauStatut, datePaiement)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.paiementEnCours.delete(id);
            this.adminData.invalidate();
            this.paginer();
          },
          error: () => {
            ins.paye = !nouveauStatut;
            ins.datePaiement = undefined;
            this.paiementEnCours.delete(id);
            this.erreurAction = 'Erreur lors de la mise à jour du paiement.';
            this.paginer();
          }
        });
    });
  }

  voirDetail(ins: PreinscriptionDto): void {
    this.router.navigate(['/admin/inscriptions', ins.idPreins]);
  }

  exporterCSV(): void {
    if (this.filtrees.length === 0) return;
    const etatPipe = new EtatLibellePipe();
    const entetes = ['Matricule', 'Nom', 'Prénom', 'Formation', 'Centre', 'État', 'Payé', 'Date'];
    const lignes = this.filtrees.map(p => [
      p.matricule ?? '',
      p.nom ?? '',
      p.prenom ?? '',
      p.choixFormation1 ?? '',
      p.centredexamen ?? '',
      etatPipe.transform(p.etatPreins),
      p.paye ? 'Oui' : 'Non',
      p.datePreins ?? ''
    ]);
    const csv = [entetes, ...lignes].map(row => row.map(v => `"${v}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscriptions_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
