import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EcoleAdminService } from '../../core/services/ecole-admin.service';
import { AuthService } from '../../auth/auth';
import { EcoleDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-ecoles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ecoles.html',
  styleUrl: './ecoles.css'
})
export class EcolesAdmin implements OnInit {
  liste: EcoleDto[] = [];
  listeFiltree: EcoleDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  codeOriginal = '';
  form: EcoleDto = this.formVide();
  confirmOuverte = false;
  ecoleASupprimer: EcoleDto | null = null;
  erreur = '';

  constructor(private svc: EcoleAdminService, public authService: AuthService) {}

  ngOnInit(): void { this.charger(); }

  private formVide(): EcoleDto {
    return { codeEcole: '', libelleFr: '', libelleEn: '', codeMat: '', dateOuverture: '', dateFermeture: '', annuler: false };
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
    this.listeFiltree = this.liste.filter(e =>
      e.codeEcole.toLowerCase().includes(q) ||
      (e.libelleFr ?? '').toLowerCase().includes(q) ||
      (e.libelleEn ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = this.formVide();
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(e: EcoleDto): void {
    this.modeEdition = true;
    this.codeOriginal = e.codeEcole;
    this.form = { ...e };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.codeEcole.trim()) { this.erreur = 'Le code de l\'école est obligatoire.'; return; }
    this.enSoumission = true;
    this.erreur = '';
    const op$ = this.modeEdition
      ? this.svc.update(this.codeOriginal, this.form)
      : this.svc.create(this.form);
    op$.subscribe({
      next: () => { this.enSoumission = false; this.fermerModal(); this.charger(); },
      error: (err: any) => { this.enSoumission = false; this.erreur = err?.message ?? err?.error?.message ?? 'Une erreur est survenue.'; }
    });
  }

  toggleActif(e: EcoleDto, event: Event): void {
    event.stopPropagation();
    const op$ = e.annuler ? this.svc.activer(e.codeEcole) : this.svc.desactiver(e.codeEcole);
    op$.subscribe({ next: () => this.charger() });
  }

  demanderSuppression(e: EcoleDto, event: Event): void {
    event.stopPropagation();
    this.ecoleASupprimer = e;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.ecoleASupprimer) return;
    this.svc.delete(this.ecoleASupprimer.codeEcole).subscribe({
      next: () => { this.confirmOuverte = false; this.ecoleASupprimer = null; this.charger(); },
      error: (err: any) => { this.erreur = err?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.ecoleASupprimer = null; }
}
