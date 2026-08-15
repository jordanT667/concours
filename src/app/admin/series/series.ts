import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SerieAdminService } from '../../core/services/serie-admin.service';
import { DiplomeAdminService } from '../../core/services/diplome-admin.service';
import { AuthService } from '../../auth/auth';
import { SerieDto, DiplomeDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './series.html',
  styleUrl: './series.css'
})
export class SeriesAdmin implements OnInit {
  liste: SerieDto[] = [];
  listeFiltree: SerieDto[] = [];
  allDiplomes: DiplomeDto[] = [];
  isLoading = false;
  recherche = '';
  modalOuverte = false;
  modeEdition = false;
  enSoumission = false;
  idOriginal = '';
  form: SerieDto = { idSerie: '', libelleFr: '', libelleEn: '', annuler: false, codeDiplomes: [] };
  confirmOuverte = false;
  itemASupprimer: SerieDto | null = null;
  erreur = '';

  constructor(
    private svc: SerieAdminService,
    private diplomeSvc: DiplomeAdminService,
    public authService: AuthService
  ) {}

  ngOnInit(): void { this.chargerDonnees(); }

  chargerDonnees(): void {
    this.isLoading = true;
    forkJoin({
      series: this.svc.getAll(),
      diplomes: this.diplomeSvc.getAll()
    }).subscribe({
      next: ({ series, diplomes }) => {
        this.liste = series;
        this.allDiplomes = diplomes.filter(d => !d.annuler);
        this.appliquerFiltres();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
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
    this.listeFiltree = this.liste.filter(c =>
      c.idSerie.toLowerCase().includes(q) || (c.libelleFr ?? '').toLowerCase().includes(q) || (c.libelleEn ?? '').toLowerCase().includes(q)
    );
  }

  ouvrirCreation(): void {
    this.modeEdition = false;
    this.form = { idSerie: '', libelleFr: '', libelleEn: '', annuler: false, codeDiplomes: [] };
    this.erreur = '';
    this.modalOuverte = true;
  }

  ouvrirEdition(c: SerieDto): void {
    this.modeEdition = true;
    this.idOriginal = c.idSerie;
    this.form = { ...c, codeDiplomes: [...(c.codeDiplomes ?? [])] };
    this.erreur = '';
    this.modalOuverte = true;
  }

  toggleItem(arr: string[], val: string): void {
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
  }

  isSelected(arr: string[], val: string): boolean { return arr.includes(val); }

  fermerModal(): void { this.modalOuverte = false; this.erreur = ''; }

  sauvegarder(): void {
    if (!this.form.idSerie || !this.form.libelleFr || !this.form.libelleEn) { this.erreur = 'Tous les champs sont obligatoires.'; return; }
    this.enSoumission = true;
    this.erreur = '';
    const op$ = this.modeEdition
      ? this.svc.update(this.idOriginal, this.form)
      : this.svc.create(this.form);
    op$.subscribe({
      next: () => {
        const diplomesCoches = new Set(this.form.codeDiplomes ?? []);
        const idSerie = this.form.idSerie;

        for (const diplome of this.allDiplomes) {
          const seriesDuDiplome = this.getSeriesForDiplome(diplome.idDiplome);
          const contientSerie = seriesDuDiplome.includes(idSerie);

          if (diplomesCoches.has(diplome.idDiplome) && !contientSerie) {
            this.svc.updateDiplomes(diplome.idDiplome, [...seriesDuDiplome, idSerie]).subscribe();
          } else if (!diplomesCoches.has(diplome.idDiplome) && contientSerie) {
            this.svc.updateDiplomes(diplome.idDiplome, seriesDuDiplome.filter(s => s !== idSerie)).subscribe();
          }
        }

        this.enSoumission = false;
        this.fermerModal();
        setTimeout(() => this.charger(), 300);
      },
      error: (err) => { this.enSoumission = false; this.erreur = err?.message ?? 'Une erreur est survenue.'; }
    });
  }

  private getSeriesForDiplome(idDiplome: string): string[] {
    return this.liste
      .filter(s => (s.codeDiplomes ?? []).includes(idDiplome))
      .map(s => s.idSerie);
  }

  toggleActif(c: SerieDto, event: Event): void {
    event.stopPropagation();
    const op$ = c.annuler ? this.svc.activer(c.idSerie) : this.svc.desactiver(c.idSerie);
    op$.subscribe({ next: () => this.charger() });
  }

  demanderSuppression(c: SerieDto, event: Event): void {
    event.stopPropagation();
    this.itemASupprimer = c;
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    if (!this.itemASupprimer) return;
    this.svc.delete(this.itemASupprimer.idSerie).subscribe({
      next: () => { this.confirmOuverte = false; this.itemASupprimer = null; this.charger(); },
      error: (err) => { this.erreur = err?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; this.itemASupprimer = null; }
}
