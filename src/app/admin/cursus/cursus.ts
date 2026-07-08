import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursusAdminService } from '../../core/services/cursus-admin.service';
import { AuthService } from '../../auth/auth';
import { CursusDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-cursus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cursus.html',
  styleUrl: './cursus.css'
})
export class CursusAdmin implements OnInit {
  liste: CursusDto[] = [];
  listeFiltree: CursusDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: CursusDto = { idCursus: '', libelle: '', annuler: false };
  confirmOuverte = false;
  cursusASupprimer: CursusDto | null = null;
  erreur = '';

  constructor(private svc: CursusAdminService, public authService: AuthService) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.isLoading = true;
    this.svc.getAll().subscribe({
      next: data => { this.liste = data; this.appliquerFiltres(); this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.listeFiltree = this.liste.filter(c =>
      c.idCursus.toLowerCase().includes(q) || c.libelle.toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idCursus: '', libelle: '', annuler: false };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: CursusDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idCursus;
    this.form = { ...c };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idCursus || !this.form.libelle) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
    this.enSoumission = true;
    this.erreur = '';
    const op$ = this.modeEdition
      ? this.svc.update(this.idOriginal, this.form)
      : this.svc.create(this.form);
    op$.subscribe({
      next: () => { this.enSoumission = false; this.fermerModal(); this.charger(); },
      error: (err) => { this.enSoumission = false; this.erreur = err?.error?.message ?? 'Une erreur est survenue.'; }
    });
  }

  toggleActif(c: CursusDto, event: Event): void {
    event.stopPropagation();
    const op$ = c.annuler ? this.svc.activer(c.idCursus) : this.svc.desactiver(c.idCursus);
    op$.subscribe({ next: () => this.charger() });
  }

  demanderSuppression(c: CursusDto, event: Event): void {
    event.stopPropagation();
    this.cursusASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.cursusASupprimer) return;
    this.svc.delete(this.cursusASupprimer.idCursus).subscribe({
      next: () => { this.confirmOuverte = false; this.cursusASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.cursusASupprimer = null; }
}
