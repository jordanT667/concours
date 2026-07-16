import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EpreuveAdminService } from '../../core/services/epreuve-admin.service';
import { ConcoursReferenceService } from '../../core/services/concours-reference.service';
import { AuthService } from '../../auth/auth';
import { EpreuveMatiereDto, CursusDto, NiveauDto, DiplomeDto, FiliereDto } from '../../core/models/referentiel.models';

@Component({
  selector: 'app-epreuves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './epreuves.html',
  styleUrl: './epreuves.css'
})
export class EpreuvesAdmin implements OnInit {
  // Dropdown data
  cursusListe: CursusDto[] = [];
  niveauxListe: NiveauDto[] = [];
  filieresListe: FiliereDto[] = [];
  diplomesListe: DiplomeDto[] = [];

  // Search filters
  idcursus = '';
  codeNiveau = '';
  codefilere = '';
  iddiplome = '';

  // Results
  matieres: EpreuveMatiereDto[] = [];
  selectedMatieres: string[] = [];
  isLoading = false;
  hasSearched = false;
  erreur = '';
  enSoumission = false;

  // Confirm delete
  confirmOuverte = false;

  constructor(
    private svc: EpreuveAdminService,
    private refSvc: ConcoursReferenceService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerReferentiels();
  }

  chargerReferentiels(): void {
    this.refSvc.getCursus().subscribe({ next: data => this.cursusListe = data });
    this.refSvc.getNiveaux().subscribe({ next: data => this.niveauxListe = data });
    this.refSvc.getFilieres().subscribe({ next: data => this.filieresListe = data });
    this.refSvc.getDiplomes().subscribe({ next: data => this.diplomesListe = data });
  }

  rechercher(): void {
    if (!this.idcursus || !this.codeNiveau || !this.codefilere || !this.iddiplome) {
      this.erreur = 'Veuillez remplir tous les filtres avant de rechercher.';
      return;
    }
    this.isLoading = true;
    this.erreur = '';
    this.hasSearched = true;
    this.svc.getMatieres(this.codefilere, this.idcursus, this.codeNiveau, this.iddiplome).subscribe({
      next: (data: EpreuveMatiereDto[]) => {
        this.matieres = data;
        this.selectedMatieres = data.map((m: EpreuveMatiereDto) => m.idMatiere);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.matieres = []; this.selectedMatieres = []; }
    });
  }

  toggleMatiere(idMatiere: string): void {
    const idx = this.selectedMatieres.indexOf(idMatiere);
    if (idx > -1) {
      this.selectedMatieres.splice(idx, 1);
    } else {
      this.selectedMatieres.push(idMatiere);
    }
  }

  isSelected(idMatiere: string): boolean {
    return this.selectedMatieres.includes(idMatiere);
  }

  enregistrer(): void {
    if (!this.idcursus || !this.codeNiveau || !this.codefilere || !this.iddiplome) { return; }
    this.enSoumission = true;
    this.erreur = '';
    this.svc.update({
      codefilere: this.codefilere,
      idcursus: this.idcursus,
      codeNiveau: this.codeNiveau,
      iddiplome: this.iddiplome,
      idMatieres: this.selectedMatieres
    }).subscribe({
      next: () => { this.enSoumission = false; this.rechercher(); },
      error: (err) => { this.enSoumission = false; this.erreur = err?.error?.message ?? 'Une erreur est survenue.'; }
    });
  }

  demanderSuppression(): void {
    this.confirmOuverte = true;
  }

  confirmerSuppression(): void {
    this.svc.delete(this.codefilere, this.idcursus, this.codeNiveau, this.iddiplome).subscribe({
      next: () => { this.confirmOuverte = false; this.matieres = []; this.selectedMatieres = []; this.hasSearched = false; },
      error: (err) => { this.erreur = err?.error?.message ?? 'Suppression impossible.'; this.confirmOuverte = false; }
    });
  }

  annulerSuppression(): void { this.confirmOuverte = false; }
}
