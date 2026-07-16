import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentionAdminService } from '../../core/services/mention-admin.service';
import { AuthService } from '../../auth/auth';
import { MentionDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-mentions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentions.html',
  styleUrl: './mentions.css'
})
export class MentionsAdmin implements OnInit {
  liste: MentionDto[] = [];
  listeFiltree: MentionDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: MentionDto = { idMention: '', libelleFr: '', libelleEn: '' };
  confirmOuverte = false;
  itemASupprimer: MentionDto | null = null;
  erreur = '';

  constructor(private svc: MentionAdminService, public authService: AuthService) {}

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
      c.idMention.toLowerCase().includes(q) || (c.libelleFr ?? '').toLowerCase().includes(q) || (c.libelleEn ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idMention: '', libelleFr: '', libelleEn: '' };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: MentionDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idMention;
    this.form = { ...c };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idMention || !this.form.libelleFr || !this.form.libelleEn) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
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

  demanderSuppression(c: MentionDto, event: Event): void {
    event.stopPropagation();
    this.itemASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.itemASupprimer) return;
    this.svc.delete(this.itemASupprimer.idMention).subscribe({
      next: () => { this.confirmOuverte = false; this.itemASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.itemASupprimer = null; }
}
