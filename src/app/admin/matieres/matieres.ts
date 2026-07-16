import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatiereAdminService } from '../../core/services/matiere-admin.service';
import { AuthService } from '../../auth/auth';
import { MatiereDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-matieres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matieres.html',
  styleUrl: './matieres.css'
})
export class MatieresAdmin implements OnInit {
  liste: MatiereDto[] = [];
  listeFiltree: MatiereDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: MatiereDto = { idMatiere: '', libelle: '' };
  confirmOuverte = false;
  itemASupprimer: MatiereDto | null = null;
  erreur = '';

  constructor(private svc: MatiereAdminService, public authService: AuthService) {}

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
      c.idMatiere.toLowerCase().includes(q) || (c.libelle ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idMatiere: '', libelle: '' };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: MatiereDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idMatiere;
    this.form = { ...c };
    this.erreur = '';
    this.modalOuverte = true;
  }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idMatiere || !this.form.libelle) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
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

  demanderSuppression(c: MatiereDto, event: Event): void {
    event.stopPropagation();
    this.itemASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.itemASupprimer) return;
    this.svc.delete(this.itemASupprimer.idMatiere).subscribe({
      next: () => { this.confirmOuverte = false; this.itemASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.itemASupprimer = null; }
}
