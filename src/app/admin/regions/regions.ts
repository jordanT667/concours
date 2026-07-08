import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegionAdminService } from '../../core/services/region-admin.service';
import { AuthService } from '../../auth/auth';
import { RegionDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './regions.html',
  styleUrl: './regions.css'
})
export class RegionsAdmin implements OnInit {
  liste: RegionDto[] = [];
  listeFiltree: RegionDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  codeOriginal = '';
  form: RegionDto = { codeRegion: '', codePays: 'CMR', libelleRegionLangue1: '', libelleRegionLangue2: '' };
  confirmOuverte = false;
  regionASupprimer: RegionDto | null = null;
  erreur = '';

  constructor(private svc: RegionAdminService, public authService: AuthService) {}

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
    this.listeFiltree = this.liste.filter(r =>
      r.codeRegion.toLowerCase().includes(q) ||
      r.libelleRegionLangue1.toLowerCase().includes(q) ||
      (r.libelleRegionLangue2 ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { codeRegion: '', codePays: 'CMR', libelleRegionLangue1: '', libelleRegionLangue2: '' };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(r: RegionDto): void {
    this.modeEdition = true;
    this.codeOriginal = r.codeRegion;
    this.form = { ...r };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.codeRegion || !this.form.libelleRegionLangue1) { this.erreur = 'Code et libellé français obligatoires.'; return; }
    this.enSoumission = true;
    this.erreur = '';
    const op$ = this.modeEdition
      ? this.svc.update(this.codeOriginal, this.form)
      : this.svc.create(this.form);
    op$.subscribe({
      next: () => { this.enSoumission = false; this.fermerModal(); this.charger(); },
      error: (err) => { this.enSoumission = false; this.erreur = err?.error?.message ?? 'Une erreur est survenue.'; }
    });
  }

  demanderSuppression(r: RegionDto, event: Event): void {
    event.stopPropagation();
    this.regionASupprimer = r;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.regionASupprimer) return;
    this.svc.delete(this.regionASupprimer.codeRegion).subscribe({
      next: () => { this.confirmOuverte = false; this.regionASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.regionASupprimer = null; }
}
