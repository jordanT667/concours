import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NiveauAdminService } from '../../core/services/niveau-admin.service';
import { CursusAdminService } from '../../core/services/cursus-admin.service';
import { AuthService } from '../../auth/auth';
import { NiveauDto, CursusDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-niveaux',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './niveaux.html',
  styleUrl: './niveaux.css'
})
export class NiveauxAdmin implements OnInit {
  liste: NiveauDto[] = [];
  listeFiltree: NiveauDto[] = [];
  allCursus: CursusDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  codeOriginal = '';
  form: NiveauDto = { codeNiveau: '', libelleNiveau: '', codeCursus: [] };
  confirmOuverte = false;
  niveauASupprimer: NiveauDto | null = null;
  erreur = '';

  constructor(
    private svc: NiveauAdminService,
    private cursusSvc: CursusAdminService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.cursusSvc.getAll().subscribe({ next: data => this.allCursus = data });
  }

  charger(): void {
    this.isLoading = true;
    this.svc.getAll().subscribe({
      next: data => { this.liste = data; this.appliquerFiltres(); this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.listeFiltree = this.liste.filter(n =>
      n.codeNiveau.toLowerCase().includes(q) || n.libelleNiveau.toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { codeNiveau: '', libelleNiveau: '', codeCursus: [] };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(n: NiveauDto): void {
    this.modeEdition = true;
    this.codeOriginal = n.codeNiveau;
    this.form = { ...n, codeCursus: [...(n.codeCursus ?? [])] };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  toggleCursus(idCursus: string): void {
    const idx = this.form.codeCursus.indexOf(idCursus);
    if (idx >= 0) this.form.codeCursus.splice(idx, 1);
    else this.form.codeCursus.push(idCursus);
  }

  isCursusSelected(idCursus: string): boolean {
    return this.form.codeCursus.includes(idCursus);
  }

  sauvegarder(): void {
    if (!this.form.codeNiveau || !this.form.libelleNiveau) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
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

  demanderSuppression(n: NiveauDto, event: Event): void {
    event.stopPropagation();
    this.niveauASupprimer = n;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.niveauASupprimer) return;
    this.svc.delete(this.niveauASupprimer.codeNiveau).subscribe({
      next: () => { this.confirmOuverte = false; this.niveauASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.niveauASupprimer = null; }

  libelleCursus(codes: string[]): string {
    if (!codes?.length) return '—';
    return codes.map(c => this.allCursus.find(a => a.idCursus === c)?.libelle ?? c).join(', ');
  }
}
