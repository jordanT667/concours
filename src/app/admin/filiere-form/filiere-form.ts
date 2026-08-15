import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FiliereDto } from '../../core/models/filiere.models';
import { CursusDto, NiveauDto, EcoleDto } from '../../core/models/referentiel.models';
import { CursusAdminService } from '../../core/services/cursus-admin.service';
import { NiveauAdminService } from '../../core/services/niveau-admin.service';
import { EcoleAdminService } from '../../core/services/ecole-admin.service';

@Component({
  selector: 'app-filiere-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filiere-form.html',
  styleUrl: './filiere-form.css'
})
export class FiliereFormComponent implements OnInit {

  @Input() filiere: FiliereDto | null = null;
  @Output() sauvegarder = new EventEmitter<FiliereDto>();
  @Output() annuler     = new EventEmitter<void>();

  estModification = false;
  erreur = '';

  allCursus: CursusDto[] = [];
  allNiveaux: NiveauDto[] = [];
  allEcoles: EcoleDto[] = [];

  form: FiliereDto = {
    codeFiliere: '',
    libelleFiliereFr: '',
    libelleFiliereEn: '',
    idCursus: '',
    codeNiveau: '',
    codeEcole: '',
  };

  constructor(
    private cursusSvc: CursusAdminService,
    private niveauSvc: NiveauAdminService,
    private ecoleSvc: EcoleAdminService
  ) {}

  isLoading = false;

  ngOnInit(): void {
    if (this.filiere) {
      this.form = { ...this.filiere };
      this.estModification = true;
    }
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.isLoading = true;
    forkJoin({
      cursus: this.cursusSvc.getAll(),
      niveaux: this.niveauSvc.getAll(),
      ecoles: this.ecoleSvc.getAll()
    }).subscribe({
      next: ({ cursus, niveaux, ecoles }) => {
        this.allCursus = cursus.filter(c => !c.annuler);
        this.allNiveaux = niveaux;
        this.allEcoles = ecoles.filter(e => !e.annuler);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onCodeInput(): void {
    this.form.codeFiliere = this.form.codeFiliere.toUpperCase();
  }

  valider(): boolean {
    this.erreur = '';
    if (!this.form.codeFiliere.trim()) {
      this.erreur = 'Le code de la filière est obligatoire.';
      return false;
    }
    if (!this.form.libelleFiliereFr.trim()) {
      this.erreur = 'Le libellé (FR) est obligatoire.';
      return false;
    }
    return true;
  }

  onSubmit(): void {
    if (!this.valider()) return;
    this.sauvegarder.emit({ ...this.form });
  }
}
