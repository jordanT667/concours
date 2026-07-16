import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentreExamenAdminService } from '../../core/services/centre-examen-admin.service';
import { AuthService } from '../../auth/auth';
import { CentreExamenDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-centres-examen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centres-examen.html',
  styleUrl: './centres-examen.css'
})
export class CentresExamenAdmin implements OnInit {
  liste: CentreExamenDto[] = [];
  listeFiltree: CentreExamenDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: Partial<CentreExamenDto> = { idCexam: '', libeleFiliereFr: '', codeNiveaux: [] };
  confirmOuverte = false;
  itemASupprimer: CentreExamenDto | null = null;
  erreur = '';

  constructor(private svc: CentreExamenAdminService, public authService: AuthService) {}

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
      c.idCexam.toLowerCase().includes(q) || c.libeleFiliereFr.toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idCexam: '', libeleFiliereFr: '', codeNiveaux: [] };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: CentreExamenDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idCexam;
    this.form = { idCexam: c.idCexam, libeleFiliereFr: c.libeleFiliereFr };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idCexam || !this.form.libeleFiliereFr) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
    this.enSoumission = true;
    this.erreur = '';
    const op$ = this.modeEdition
      ? this.svc.update(this.idOriginal, this.form as CentreExamenDto)
      : this.svc.create(this.form as CentreExamenDto);
    op$.subscribe({
      next: () => { this.enSoumission = false; this.fermerModal(); this.charger(); },
      error: (err) => { this.enSoumission = false; this.erreur = err?.error?.message ?? 'Une erreur est survenue.'; }
    });
  }

  demanderSuppression(c: CentreExamenDto, event: Event): void {
    event.stopPropagation();
    this.itemASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.itemASupprimer) return;
    this.svc.delete(this.itemASupprimer.idCexam).subscribe({
      next: () => { this.confirmOuverte = false; this.itemASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.itemASupprimer = null; }
}
