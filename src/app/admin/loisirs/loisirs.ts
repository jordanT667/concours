import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoisirAdminService } from '../../core/services/loisir-admin.service';
import { AuthService } from '../../auth/auth';
import { LoisirDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-loisirs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loisirs.html',
  styleUrl: './loisirs.css'
})
export class LoisirsAdmin implements OnInit {
  liste: LoisirDto[] = [];
  listeFiltree: LoisirDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: LoisirDto = { idLoisir: '', libelleFr: '', libelleEn: '', annuler: false };
  confirmOuverte = false;
  itemASupprimer: LoisirDto | null = null;
  erreur = '';

  constructor(private svc: LoisirAdminService, public authService: AuthService) {}

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
      c.idLoisir.toLowerCase().includes(q) || (c.libelleFr ?? '').toLowerCase().includes(q) || (c.libelleEn ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idLoisir: '', libelleFr: '', libelleEn: '', annuler: false };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: LoisirDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idLoisir;
    this.form = { ...c };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idLoisir || !this.form.libelleFr || !this.form.libelleEn) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
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

  toggleActif(c: LoisirDto, event: Event): void {
    event.stopPropagation();
    const op$ = c.annuler ? this.svc.activer(c.idLoisir) : this.svc.desactiver(c.idLoisir);
    op$.subscribe({ next: () => this.charger() });
  }

  demanderSuppression(c: LoisirDto, event: Event): void {
    event.stopPropagation();
    this.itemASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.itemASupprimer) return;
    this.svc.delete(this.itemASupprimer.idLoisir).subscribe({
      next: () => { this.confirmOuverte = false; this.itemASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.itemASupprimer = null; }
}
