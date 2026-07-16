import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteDepotAdminService } from '../../core/services/site-depot-admin.service';
import { AuthService } from '../../auth/auth';
import { SiteDepotDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-sites-depot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sites-depot.html',
  styleUrl: './sites-depot.css'
})
export class SitesDepotAdmin implements OnInit {
  liste: SiteDepotDto[] = [];
  listeFiltree: SiteDepotDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: Partial<SiteDepotDto> = { idSiteDepot: '', libelle: '' };
  confirmOuverte = false;
  itemASupprimer: SiteDepotDto | null = null;
  erreur = '';

  constructor(private svc: SiteDepotAdminService, public authService: AuthService) {}

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
      c.idSiteDepot.toLowerCase().includes(q) || (c.libelle ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idSiteDepot: '', libelle: '' };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: SiteDepotDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idSiteDepot;
    this.form = { idSiteDepot: c.idSiteDepot, libelle: c.libelle };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idSiteDepot || !this.form.libelle) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
    this.enSoumission = true;
    this.erreur = '';
    const op$ = this.modeEdition
      ? this.svc.update(this.idOriginal, this.form as SiteDepotDto)
      : this.svc.create(this.form as SiteDepotDto);
    op$.subscribe({
      next: () => { this.enSoumission = false; this.fermerModal(); this.charger(); },
      error: (err) => { this.enSoumission = false; this.erreur = err?.error?.message ?? 'Une erreur est survenue.'; }
    });
  }

  demanderSuppression(c: SiteDepotDto, event: Event): void {
    event.stopPropagation();
    this.itemASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.itemASupprimer) return;
    this.svc.delete(this.itemASupprimer.idSiteDepot).subscribe({
      next: () => { this.confirmOuverte = false; this.itemASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.itemASupprimer = null; }
}
