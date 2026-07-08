import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartementAdminService } from '../../core/services/departement-admin.service';
import { RegionAdminService } from '../../core/services/region-admin.service';
import { AuthService } from '../../auth/auth';
import { DepartementDto, RegionDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departements.html',
  styleUrl: './departements.css'
})
export class DepartementsAdmin implements OnInit {
  liste: DepartementDto[] = [];
  listeFiltree: DepartementDto[] = [];
  allRegions: RegionDto[] = [];
  filtreRegion = '';
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  codeOriginal = '';
  form: DepartementDto = { codeDepartementGeographique: '', codeRegion: '', libelleDepartementGeographiqueLangue1: '', libelleDepartementGeographiqueLangue2: '' };
  confirmOuverte = false;
  deptASupprimer: DepartementDto | null = null;
  erreur = '';

  constructor(
    private svc: DepartementAdminService,
    private regionSvc: RegionAdminService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.regionSvc.getAll().subscribe({ next: data => this.allRegions = data });
  }

  charger(): void {
    this.isLoading = true;
    this.svc.getAll(this.filtreRegion || undefined).subscribe({
      next: data => { this.liste = data; this.appliquerFiltres(); this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  onFiltreRegionChange(): void { this.charger(); }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.listeFiltree = this.liste.filter(d =>
      d.codeDepartementGeographique.toLowerCase().includes(q) ||
      d.libelleDepartementGeographiqueLangue1.toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { codeDepartementGeographique: '', codeRegion: this.filtreRegion || '', libelleDepartementGeographiqueLangue1: '', libelleDepartementGeographiqueLangue2: '' };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(d: DepartementDto): void {
    this.modeEdition = true;
    this.codeOriginal = d.codeDepartementGeographique;
    this.form = { ...d };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.codeDepartementGeographique || !this.form.libelleDepartementGeographiqueLangue1 || !this.form.codeRegion) {
      this.erreur = 'Code, libellé et région sont obligatoires.'; return;
    }
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

  demanderSuppression(d: DepartementDto, event: Event): void {
    event.stopPropagation();
    this.deptASupprimer = d;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.deptASupprimer) return;
    this.svc.delete(this.deptASupprimer.codeDepartementGeographique).subscribe({
      next: () => { this.confirmOuverte = false; this.deptASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.deptASupprimer = null; }

  libelleRegion(code: string): string {
    return this.allRegions.find(r => r.codeRegion === code)?.libelleRegionLangue1 ?? code;
  }
}
