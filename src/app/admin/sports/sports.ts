import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SportAdminService } from '../../core/services/sport-admin.service';
import { AuthService } from '../../auth/auth';
import { SportDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sports.html',
  styleUrl: './sports.css'
})
export class SportsAdmin implements OnInit {
  liste: SportDto[] = [];
  listeFiltree: SportDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: SportDto = { idSport: '', libelleFr: '', libelleEn: '', annuler: false };
  confirmOuverte = false;
  itemASupprimer: SportDto | null = null;
  erreur = '';

  constructor(private svc: SportAdminService, public authService: AuthService) {}

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
      c.idSport.toLowerCase().includes(q) || (c.libelleFr ?? '').toLowerCase().includes(q) || (c.libelleEn ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idSport: '', libelleFr: '', libelleEn: '', annuler: false };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: SportDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idSport;
    this.form = { ...c };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idSport || !this.form.libelleFr || !this.form.libelleEn) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
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

  toggleActif(c: SportDto, event: Event): void {
    event.stopPropagation();
    const op$ = c.annuler ? this.svc.activer(c.idSport) : this.svc.desactiver(c.idSport);
    op$.subscribe({ next: () => this.charger() });
  }

  demanderSuppression(c: SportDto, event: Event): void {
    event.stopPropagation();
    this.itemASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.itemASupprimer) return;
    this.svc.delete(this.itemASupprimer.idSport).subscribe({
      next: () => { this.confirmOuverte = false; this.itemASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.itemASupprimer = null; }
}
