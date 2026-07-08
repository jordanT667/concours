import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiplomeAdminService } from '../../core/services/diplome-admin.service';
import { CursusAdminService } from '../../core/services/cursus-admin.service';
import { NiveauAdminService } from '../../core/services/niveau-admin.service';
import { AuthService } from '../../auth/auth';
import { DiplomeDto, CursusDto, NiveauDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-diplomes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diplomes.html',
  styleUrl: './diplomes.css'
})
export class DiplomesAdmin implements OnInit {
  liste: DiplomeDto[] = [];
  listeFiltree: DiplomeDto[] = [];
  allCursus: CursusDto[] = [];
  allNiveaux: NiveauDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: DiplomeDto = { idDiplome: '', libelleFr: '', libelleEn: '', annuler: false, codeCursus: [], codeNiveaux: [] };
  confirmOuverte = false;
  diplomeASupprimer: DiplomeDto | null = null;
  erreur = '';

  constructor(
    private svc: DiplomeAdminService,
    private cursusSvc: CursusAdminService,
    private niveauSvc: NiveauAdminService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.cursusSvc.getAll().subscribe({ next: data => this.allCursus = data });
    this.niveauSvc.getAll().subscribe({ next: data => this.allNiveaux = data });
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
    this.listeFiltree = this.liste.filter(d =>
      d.idDiplome.toLowerCase().includes(q) ||
      d.libelleFr.toLowerCase().includes(q) ||
      d.libelleEn.toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idDiplome: '', libelleFr: '', libelleEn: '', annuler: false, codeCursus: [], codeNiveaux: [] };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(d: DiplomeDto): void {
    this.modeEdition = true;
    this.idOriginal = d.idDiplome;
    this.form = { ...d, codeCursus: [...(d.codeCursus ?? [])], codeNiveaux: [...(d.codeNiveaux ?? [])] };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  toggleItem(arr: string[], val: string): void {
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
  }

  isSelected(arr: string[], val: string): boolean { return arr.includes(val); }

  sauvegarder(): void {
    if (!this.form.idDiplome || !this.form.libelleFr) { this.erreur = 'Code et libellé français obligatoires.'; return; }
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

  toggleActif(d: DiplomeDto, event: Event): void {
    event.stopPropagation();
    const op$ = d.annuler ? this.svc.activer(d.idDiplome) : this.svc.desactiver(d.idDiplome);
    op$.subscribe({ next: () => this.charger() });
  }

  demanderSuppression(d: DiplomeDto, event: Event): void {
    event.stopPropagation();
    this.diplomeASupprimer = d;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.diplomeASupprimer) return;
    this.svc.delete(this.diplomeASupprimer.idDiplome).subscribe({
      next: () => { this.confirmOuverte = false; this.diplomeASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.diplomeASupprimer = null; }
}
