import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

import { ConcoursReferenceService } from '../../../core/services/concours-reference.service';
import { ReferenceStore } from '../../../core/services/reference-store.service';
import { STORAGE_KEYS } from '../../../core/services/storage';
import { PaysDto } from '../../../core/models/pays.models';
import {
  CursusDto, NiveauDto, DiplomeDto, FiliereDto,
  SerieDto, MentionDto, BanqueDto, CentreExamenDto, SiteDepotDto, EpreuveMatiereDto
} from '../../../core/models/referentiel.models';
import { LoggerService } from '../../../core/services/logger.service';
import { AutosaveService, AutosaveStatus } from '../../../core/services/autosave.service';
import { AutosaveIndicator } from '../../../shared/autosave-indicator/autosave-indicator';

@Component({
  selector: 'app-step-specialisation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AutosaveIndicator],
  templateUrl: './step-specialisation.html',
  styleUrl: './step-specialisation.css'
})
export class StepSpecialisation implements OnInit, OnDestroy {

  form!: FormGroup;

  imagePreview: string | null = null;
  imageNom: string = '';
  imageErreur: string = '';

  anneesCourantes: number[] = [];
  anneesBEPC: number[] = [];

  cursusOptions: CursusDto[] = [];
  niveauxTous: NiveauDto[] = [];
  niveauxFiltres: NiveauDto[] = [];
  filieresFiltrees: FiliereDto[] = [];
  diplomesAdmission: DiplomeDto[] = [];
  paysOptions: PaysDto[] = [];

  seriesFiltrees: SerieDto[] = [];
  mentionsOptions: MentionDto[] = [];
  centresConcours: CentreExamenDto[] = [];
  centresDepot: SiteDepotDto[] = [];
  banquesOptions: BanqueDto[] = [];
  epreuvesOptions: EpreuveMatiereDto[] = [];

  chargement = true;
  erreurChargement = '';

  autosaveStatus$!: Observable<AutosaveStatus>;
  private formSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ref: ConcoursReferenceService,
    private refStore: ReferenceStore,
    private logger: LoggerService,
    private autosave: AutosaveService
  ) {}

  ngOnInit(): void {
    this.autosaveStatus$ = this.autosave.status$;
    this.genererAnnees();
    this.buildForm();
    this.chargerDonneesReference();
    this.formSub = this.form.valueChanges.subscribe(val => {
      if (this.form.dirty) {
        const toSave = { ...val, imageNom: this.imageNom };
        delete toSave.imageRecu;
        this.autosave.schedule(STORAGE_KEYS.SPECIALISATION, toSave);
      }
    });
  }

  ngOnDestroy(): void { this.formSub?.unsubscribe(); }

  private genererAnnees(): void {
    this.ref.getAnnees(15).subscribe({
      next: (data) => { this.anneesCourantes = data; },
      error: () => {
        const an = new Date().getFullYear();
        for (let a = an; a >= an - 15; a--) this.anneesCourantes.push(a);
      }
    });
    this.ref.getAnnees(20).subscribe({
      next: (data) => { this.anneesBEPC = data; },
      error: () => {
        const an = new Date().getFullYear();
        for (let a = an; a >= an - 20; a--) this.anneesBEPC.push(a);
      }
    });
  }

  private chargerDonneesReference(): void {
    this.chargement = true;
    this.erreurChargement = '';

    this.refStore.load().subscribe({
      next: (data) => {
        this.cursusOptions = data.cursus.filter(c => !c.annuler);
        this.niveauxTous = data.niveaux;
        this.paysOptions = data.pays;
        this.mentionsOptions = data.mentions;
        this.banquesOptions = data.banques.filter((b: any) => !b.annuler);
        this.centresConcours = data.centres;
        this.centresDepot = data.sites;
        this.diplomesAdmission = data.diplomes.filter((d: any) => !d.annuler);

        const critical = data.cursus.length + data.niveaux.length + data.diplomes.length;
        if (critical === 0) {
          this.erreurChargement = 'Impossible de charger les données. Vérifiez votre connexion.';
        }
        this.chargement = false;
        this.restoreFromStorage();
      },
      error: () => {
        this.erreurChargement = 'Impossible de charger les données. Vérifiez votre connexion.';
        this.chargement = false;
      }
    });
  }

  private buildForm(): void {
    const an = new Date().getFullYear();
    this.form = this.fb.group({
      cursus: ['', Validators.required],
      niveau: ['', Validators.required],
      filiere: ['', Validators.required],
      diplomeAdmission: ['', Validators.required],
      serieDiplome: ['', Validators.required],
      mentionDiplome: ['', Validators.required],
      anneeObtentionDip: [an, Validators.required],
      etablissementObtention: ['', Validators.required],
      paysObtention: ['', Validators.required],
      anneeBEPC: [an, Validators.required],
      choixEpreuve: ['RAS'],
      centreConcours: ['', Validators.required],
      centreDepotDossier: ['', Validators.required],
      numeroRecuCCA: ['', Validators.required],
      banque: ['', Validators.required],
      imageRecu: ['', Validators.required],
    });
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const saved = localStorage.getItem(STORAGE_KEYS.SPECIALISATION);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      const { cursus, niveau, filiere, imageRecu, ...reste } = data;
      this.form.patchValue(reste);
      if (data.diplomeAdmission) {
        this.ref.getSeriesByDiplome(data.diplomeAdmission).subscribe({
          next: (series) => { this.seriesFiltrees = series.filter(s => !s.annuler); },
          error: () => {}
        });
      }
      if (data.imageNom) {
        this.imageNom = data.imageNom;
      }
    } catch (e) { this.logger.error('Erreur localStorage', e); }
  }

  onCursusChange(event: Event): void {
    const idCursus = (event.target as HTMLSelectElement).value;
    this.form.get('niveau')?.setValue('');
    this.form.get('filiere')?.setValue('');
    this.form.get('diplomeAdmission')?.setValue('');
    this.form.get('serieDiplome')?.setValue('');
    this.niveauxFiltres = [];
    this.filieresFiltrees = [];
    this.seriesFiltrees = [];
    if (idCursus) {
      this.filtrerNiveauxEtFilieres(idCursus, '');
      this.ref.getSitesDepotByCursus(idCursus).subscribe({
        next: (data) => { this.centresDepot = data; },
        error: () => {}
      });
    }
  }

  private filtrerNiveauxEtFilieres(idCursus: string, codeNiveau: string): void {
    this.niveauxFiltres = [...this.niveauxTous];
    this.ref.getFilieres(idCursus, codeNiveau || '*').subscribe({
      next: (data) => { this.filieresFiltrees = data.filter(f => !f.annuler); },
      error: () => { this.filieresFiltrees = []; }
    });
  }

  onNiveauChange(event: Event): void {
    const codeNiveau = (event.target as HTMLSelectElement).value;
    const idCursus = this.form.get('cursus')?.value;
    this.form.get('filiere')?.setValue('');
    if (idCursus && codeNiveau) {
      this.ref.getFilieres(idCursus, codeNiveau).subscribe({
        next: (data) => { this.filieresFiltrees = data.filter(f => !f.annuler); },
        error: () => { this.filieresFiltrees = []; }
      });
      this.ref.getCentresExamenByNiveau(codeNiveau).subscribe({
        next: (data) => { this.centresConcours = data; },
        error: () => {}
      });
    }
  }

  onDiplomeChange(event: Event): void {
    const idDiplome = (event.target as HTMLSelectElement).value;
    this.form.get('serieDiplome')?.setValue('');
    this.seriesFiltrees = [];
    if (idDiplome) {
      this.ref.getSeriesByDiplome(idDiplome).subscribe({
        next: (data) => { this.seriesFiltrees = data.filter(s => !s.annuler); },
        error: () => { this.seriesFiltrees = []; }
      });
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageErreur = '';
    if (!input.files || !input.files.length) return;
    const fichier = input.files[0];
    if (fichier.size > 2 * 1024 * 1024) {
      this.imageErreur = 'Fichier trop lourd. Maximum 2 Mo.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.imageNom = fichier.name;
      this.form.get('imageRecu')?.setValue('selected');
      this.form.get('imageRecu')?.markAsTouched();
    };
    reader.onerror = () => { this.imageErreur = 'Erreur de lecture du fichier.'; };
    reader.readAsDataURL(fichier);
  }

  supprimerImage(): void {
    this.imagePreview = null;
    this.imageNom = '';
    this.form.get('imageRecu')?.setValue('');
  }

  get f() { return this.form.controls; }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onNext(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const toSave = { ...this.form.value, imageNom: this.imageNom };
    delete toSave.imageRecu;
    this.autosave.saveNow(STORAGE_KEYS.SPECIALISATION, toSave);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, '3');
    this.router.navigate(['/inscription/cursus']);
  }

  onBack(): void { this.router.navigate(['/inscription/identification']); }
}
