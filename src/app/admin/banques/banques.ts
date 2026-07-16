import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BanqueAdminService } from '../../core/services/banque-admin.service';
import { AuthService } from '../../auth/auth';
import { BanqueDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-banques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banques.html',
  styleUrl: './banques.css'
})
export class BanquesAdmin implements OnInit {
  liste: BanqueDto[] = [];
  listeFiltree: BanqueDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: BanqueDto = { idBanque: '', libelleBanque: '', annuler: false };
  confirmOuverte = false;
  itemASupprimer: BanqueDto | null = null;
  erreur = '';

  constructor(private svc: BanqueAdminService, public authService: AuthService) {}

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
      c.idBanque.toLowerCase().includes(q) || (c.libelleBanque ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idBanque: '', libelleBanque: '', annuler: false };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: BanqueDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idBanque;
    this.form = { ...c };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idBanque || !this.form.libelleBanque) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
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

  toggleActif(c: BanqueDto, event: Event): void {
    event.stopPropagation();
    const op$ = c.annuler ? this.svc.activer(c.idBanque) : this.svc.desactiver(c.idBanque);
    op$.subscribe({ next: () => this.charger() });
  }

  demanderSuppression(c: BanqueDto, event: Event): void {
    event.stopPropagation();
    this.itemASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.itemASupprimer) return;
    this.svc.delete(this.itemASupprimer.idBanque).subscribe({
      next: () => { this.confirmOuverte = false; this.itemASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.itemASupprimer = null; }
}
