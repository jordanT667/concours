import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, of } from 'rxjs';
import { CursusAdminService } from '../../core/services/cursus-admin.service';
import { NiveauAdminService } from '../../core/services/niveau-admin.service';
import { FiliereService } from '../../core/services/filiere';
import { CursusDto, NiveauDto } from '../../core/models/referentiel.models';
import { FiliereDto } from '../../core/models/filiere.models';

interface LigneRecap {
  id: number;
  cursusCode: string;
  cursusLibelle: string;
  niveauCode: string;
  niveauLibelle: string;
  filiereCode: string;
  filiereFr: string;
  filiereEn: string;
}

@Component({
  selector: 'app-g-cursus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './g-cursus.html',
  styleUrl: './g-cursus.css'
})
export class GCursus implements OnInit {

  allCursus: CursusDto[] = [];
  allNiveaux: NiveauDto[] = [];
  allFilieres: FiliereDto[] = [];

  formCursus = { code: '', libelle: '' };
  formNiveau = { code: '', libelle: '' };
  formFiliere = { code: '', libelleFr: '', libelleEn: '' };

  lignes: LigneRecap[] = [];
  compteur = 0;

  isLoading = false;
  enSoumission = false;
  erreur = '';
  succes = '';

  editIndex: number | null = null;

  constructor(
    private cursusSvc: CursusAdminService,
    private niveauSvc: NiveauAdminService,
    private filiereSvc: FiliereService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.isLoading = true;
    this.cursusSvc.getAll().subscribe({
      next: data => {
        this.allCursus = data.filter(c => !c.annuler);
        this.niveauSvc.getAll().subscribe({
          next: niveaux => {
            this.allNiveaux = niveaux;
            this.filiereSvc.getAll().subscribe({
              next: filieres => {
                this.allFilieres = filieres.filter(f => !f.annuler);
                this.isLoading = false;
              },
              error: () => { this.isLoading = false; }
            });
          },
          error: () => { this.isLoading = false; }
        });
      },
      error: () => { this.isLoading = false; this.erreur = 'Impossible de charger les données.'; }
    });
  }

  ajouter(): void {
    if (!this.formCursus.code || !this.formCursus.libelle) {
      this.erreur = 'Le code et le libellé du cursus sont obligatoires.';
      return;
    }
    if (!this.formNiveau.code || !this.formNiveau.libelle) {
      this.erreur = 'Le code et le libellé du niveau sont obligatoires.';
      return;
    }

    this.erreur = '';
    this.enSoumission = true;

    const cursusExiste = this.allCursus.find(c => c.idCursus === this.formCursus.code);
    const cursusDto: CursusDto = {
      idCursus: this.formCursus.code,
      libelle: this.formCursus.libelle,
      annuler: false
    };

    const cursus$ = cursusExiste
      ? of(cursusExiste)
      : this.cursusSvc.create(cursusDto);

    cursus$.pipe(
      switchMap(() => {
        const niveauExiste = this.allNiveaux.find(n => n.codeNiveau === this.formNiveau.code);
        if (niveauExiste) {
          const codesUpdated = [...new Set([...(niveauExiste.codeCursus || []), this.formCursus.code])];
          return this.niveauSvc.updateCursus(niveauExiste.codeNiveau, codesUpdated);
        }
        return this.niveauSvc.create({
          codeNiveau: this.formNiveau.code,
          libelleNiveau: this.formNiveau.libelle,
          codeCursus: [this.formCursus.code]
        });
      }),
      switchMap(() => {
        if (!this.formFiliere.code || !this.formFiliere.libelleFr) {
          return of(null);
        }
        const filiereExiste = this.allFilieres.find(f => f.codeFiliere === this.formFiliere.code);
        const filiereDto: FiliereDto = {
          codeFiliere: this.formFiliere.code,
          libelleFiliereFr: this.formFiliere.libelleFr,
          libelleFiliereEn: this.formFiliere.libelleEn || undefined,
          idCursus: this.formCursus.code,
          codeNiveau: this.formNiveau.code
        };
        return filiereExiste
          ? this.filiereSvc.update(filiereExiste.codeFiliere, filiereDto)
          : this.filiereSvc.create(filiereDto);
      })
    ).subscribe({
      next: () => {
        const ligne: LigneRecap = {
          id: ++this.compteur,
          cursusCode: this.formCursus.code,
          cursusLibelle: this.formCursus.libelle,
          niveauCode: this.formNiveau.code,
          niveauLibelle: this.formNiveau.libelle,
          filiereCode: this.formFiliere.code,
          filiereFr: this.formFiliere.libelleFr,
          filiereEn: this.formFiliere.libelleEn
        };

        if (this.editIndex !== null) {
          this.lignes[this.editIndex] = ligne;
          this.editIndex = null;
          this.succes = 'Combinaison modifiée et enregistrée.';
        } else {
          this.lignes.push(ligne);
          this.succes = 'Combinaison créée avec succès.';
        }

        this.enSoumission = false;
        this.resetForm();
        this.chargerDonnees();
        setTimeout(() => this.succes = '', 4000);
      },
      error: (err) => {
        this.enSoumission = false;
        this.erreur = err?.message ?? err?.error?.message ?? 'Erreur lors de l\'enregistrement.';
      }
    });
  }

  editer(index: number): void {
    const l = this.lignes[index];
    this.formCursus = { code: l.cursusCode, libelle: l.cursusLibelle };
    this.formNiveau = { code: l.niveauCode, libelle: l.niveauLibelle };
    this.formFiliere = { code: l.filiereCode, libelleFr: l.filiereFr, libelleEn: l.filiereEn };
    this.editIndex = index;
  }

  supprimer(index: number): void {
    this.lignes.splice(index, 1);
    if (this.editIndex === index) {
      this.editIndex = null;
      this.resetForm();
    }
  }

  annulerEdition(): void {
    this.editIndex = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formCursus = { code: '', libelle: '' };
    this.formNiveau = { code: '', libelle: '' };
    this.formFiliere = { code: '', libelleFr: '', libelleEn: '' };
  }
}
