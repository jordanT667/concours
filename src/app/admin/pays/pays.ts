import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaysService } from '../../core/services/pays.service';
import { AuthService } from '../../auth/auth';
import { PaysDto } from '../../core/models/pays.models';

@Component({
  selector: 'app-pays',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pays.html',
  styleUrl: './pays.css'
})
export class Pays implements OnInit {

  liste: PaysDto[] = [];
  listeFiltree: PaysDto[] = [];
  isLoading = false;
  recherche = '';

  // Modal
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  codeOriginal = '';

  form: PaysDto = { codePays: '', libelleFr: '', libelleEn: '' };

  // Confirmation suppression
  confirmOuverte = false;
  paysASupprimer: PaysDto | null = null;

  erreur = '';

  constructor(
    private paysService: PaysService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.isLoading = true;
    this.paysService.getActifs().subscribe({
      next: data => {
        this.liste = data;
        this.appliquerFiltres();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.listeFiltree = this.liste.filter(p =>
      p.codePays.toLowerCase().includes(q) ||
      p.libelleFr.toLowerCase().includes(q) ||
      p.libelleEn.toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { codePays: '', libelleFr: '', libelleEn: '' };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(pays: PaysDto): void {
    this.modeEdition = true;
    this.codeOriginal = pays.codePays;
    this.form = { ...pays };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void {
    this.modalOuverte = false;
    this.erreur = '';
  }

  sauvegarder(): void {
    if (!this.form.codePays || !this.form.libelleFr || !this.form.libelleEn) {
      this.erreur = 'Tous les champs sont obligatoires.';
      return;
    }
    if (this.form.codePays.length !== 3) {
      this.erreur = 'Le code pays doit contenir exactement 3 caractères.';
      return;
    }

    this.enSoumission = true;
    this.erreur = '';

    const op$ = this.modeEdition
      ? this.paysService.update(this.codeOriginal, this.form)
      : this.paysService.create(this.form);

    op$.subscribe({
      next: () => {
        this.enSoumission = false;
        this.fermerModal();
        this.charger();
      },
      error: (err) => {
        this.enSoumission = false;
        this.erreur = err?.error?.message ?? 'Une erreur est survenue.';
      }
    });
  }

  demanderDesactivation(pays: PaysDto, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Désactiver le pays "${pays.libelleFr}" ?`)) return;
    this.paysService.desactiver(pays.codePays).subscribe({
      next: () => this.charger()
    });
  }

  demanderSuppression(pays: PaysDto, event: Event): void {
    event.stopPropagation();
    this.paysASupprimer = pays;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.paysASupprimer) return;
    this.paysService.delete(this.paysASupprimer.codePays).subscribe({
      next: () => {
        this.confirmOuverte = false;
        this.paysASupprimer = null;
        this.charger();
      },
      error: (err) => {
        console.error('Erreur suppression pays:', err);
        this.erreur = err?.error?.message ?? `Erreur ${err?.status} — suppression impossible.`;
        this.confirmOuverte = false;
      }
    });
  }

  annulerSuppression(): void {
    this.confirmOuverte = false;
    this.paysASupprimer = null;
  }
}
