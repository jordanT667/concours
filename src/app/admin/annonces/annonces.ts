import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Annonce } from '../../core/models/annonce.models';
import { AnnonceService } from '../../core/services/annonce.service';
import { AnnonceForm } from '../annonce-from/annonce-from';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-annonces',
  standalone: true,
  imports: [CommonModule, FormsModule, AnnonceForm, ConfirmDialog],
  templateUrl: './annonces.html',
  styleUrl: './annonces.css'
})
export class Annonces implements OnInit {

  private destroyRef = inject(DestroyRef);

  annonces: Annonce[] = [];
  formulaireOuvert = false;
  annonceSelectionnee: Annonce | null = null;

  // Confirmation
  confirmOuverte = false;
  private confirmId = 0;

  constructor(public service: AnnonceService) {}

  ngOnInit(): void {
    this.service.annonces$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(liste => {
        this.annonces = [...liste].sort((a, b) => a.ordre - b.ordre);
      });
  }

  ouvrirFormulaire(a?: Annonce): void {
    this.annonceSelectionnee = a ?? null;
    this.formulaireOuvert = true;
  }

  fermerFormulaire(): void {
    this.formulaireOuvert = false;
    this.annonceSelectionnee = null;
  }

  sauvegarder(a: Annonce): void {
    this.service.sauvegarder(a);
    this.fermerFormulaire();
  }

  toggleActif(a: Annonce): void {
    this.service.toggleActif(a.id);
  }

  monterOrdre(a: Annonce): void {
    this.service.monterOrdre(a.id);
  }

  descendreOrdre(a: Annonce): void {
    this.service.descendreOrdre(a.id);
  }

  supprimer(id: number): void {
    this.confirmId = id;
    this.confirmOuverte = true;
  }

  onConfirmerSuppression(): void {
    this.confirmOuverte = false;
    this.service.supprimer(this.confirmId);
  }

  onAnnulerSuppression(): void {
    this.confirmOuverte = false;
  }

  cssAnnonce(couleur: string): string {
    return this.service.cssClass(couleur);
  }

  get totalActives(): number {
    return this.annonces.filter(a => a.actif).length;
  }
}
