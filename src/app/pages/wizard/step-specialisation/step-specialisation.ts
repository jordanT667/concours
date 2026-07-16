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

  // Données chargées depuis l'API
  cursusOptions: CursusDto[] = [];
  niveauxTous: NiveauDto[] = [];
  niveauxFiltres: NiveauDto[] = [];
  domainesFiltres: FiliereDto[] = [];
  diplomesAdmission: DiplomeDto[] = [];
  paysOptions: PaysDto[] = [];

  // Données dynamiques depuis l'API
  seriesFiltrees: SerieDto[] = [];
  mentionsOptions: MentionDto[] = [];
  centresConcours: CentreExamenDto[] = [];
  centresDepot: SiteDepotDto[] = [];
  banquesOptions: BanqueDto[] = [];
  epreuvesOptions: EpreuveMatiereDto[] = [];

  chargement = false;
  erreurChargement = '';

  autosaveStatus$!: Observable<AutosaveStatus>;
  private formSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ref: ConcoursReferenceService,
    private logger: LoggerService,
    private autosave: AutosaveService
  ) {}

  ngOnInit(): void {
    this.autosaveStatus$ = this.autosave.status$;
    this.genererAnnees();
    this.buildForm();
    this.chargerDonneesReference();
    this.formSub = this.form.valueChanges.subscribe(val => {
      if (this.form.dirty) this.autosave.schedule('enstmo_specialisation', { ...val, imageNom: this.imageNom });
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

    this.ref.getCursus().subscribe({
      next: (data) => { this.cursusOptions = data.filter(c => !c.annuler); },
      error: () => { this.erreurChargement = 'Impossible de charger les cursus.'; }
    });

    this.ref.getNiveaux().subscribe({
      next: (data) => { this.niveauxTous = data; },
      error: () => { this.erreurChargement = 'Impossible de charger les niveaux.'; }
    });

    this.ref.getPays().subscribe({
      next: (data) => { this.paysOptions = data; },
      error: () => { this.erreurChargement = 'Impossible de charger les pays.'; }
    });

    this.ref.getMentions().subscribe({
      next: (data) => { this.mentionsOptions = data; },
      error: () => { this.erreurChargement = 'Impossible de charger les mentions.'; }
    });

    this.ref.getBanques().subscribe({
      next: (data) => { this.banquesOptions = data.filter(b => !b.annuler); },
      error: () => { this.erreurChargement = 'Impossible de charger les banques.'; }
    });

    this.ref.getCentresExamen().subscribe({
      next: (data) => { this.centresConcours = data; },
      error: () => { this.erreurChargement = 'Impossible de charger les centres d\'examen.'; }
    });

    this.ref.getSitesDepot().subscribe({
      next: (data) => { this.centresDepot = data; },
      error: () => { this.erreurChargement = 'Impossible de charger les sites de dépôt.'; }
    });

    this.ref.getDiplomes().subscribe({
      next: (data) => {
        this.diplomesAdmission = data.filter(d => !d.annuler);
        this.chargement = false;
        this.restoreFromStorage();
      },
      error: () => {
        this.erreurChargement = 'Impossible de charger les diplômes.';
        this.chargement = false;
      }
    });
  }

  private buildForm(): void {
    const an = new Date().getFullYear();
    this.form = this.fb.group({
      cursus: ['', Validators.required],
      niveau: ['', Validators.required],
      domaineFormation: ['', Validators.required],
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
    const saved = localStorage.getItem('enstmo_specialisation');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      this.form.patchValue(data);
      if (data.cursus) {
        this.filtrerNiveauxEtFilieres(data.cursus, data.niveau);
        this.ref.getSitesDepotByCursus(data.cursus).subscribe({
          next: (sites) => { this.centresDepot = sites; },
          error: () => {}
        });
      }
      if (data.niveau) {
        this.ref.getCentresExamenByNiveau(data.niveau).subscribe({
          next: (centres) => { this.centresConcours = centres; },
          error: () => {}
        });
      }
      if (data.diplomeAdmission) {
        this.ref.getSeriesByDiplome(data.diplomeAdmission).subscribe({
          next: (series) => { this.seriesFiltrees = series.filter(s => !s.annuler); },
          error: () => {}
        });
      }
      if (data.imageRecu) {
        this.imagePreview = data.imageRecu;
        this.imageNom = data.imageNom || '';
      }
    } catch (e) { this.logger.error('Erreur localStorage', e); }
  }

  onCursusChange(event: Event): void {
    const idCursus = (event.target as HTMLSelectElement).value;
    this.form.get('niveau')?.setValue('');
    this.form.get('domaineFormation')?.setValue('');
    this.niveauxFiltres = [];
    this.domainesFiltres = [];
    if (idCursus) {
      this.filtrerNiveauxEtFilieres(idCursus, '');
      this.ref.getDiplomes(idCursus).subscribe({
        next: (data) => { this.diplomesAdmission = data.filter(d => !d.annuler); },
        error: () => {}
      });
      this.ref.getSitesDepotByCursus(idCursus).subscribe({
        next: (data) => { this.centresDepot = data; },
        error: () => {}
      });
    }
  }

  private filtrerNiveauxEtFilieres(idCursus: string, codeNiveau: string): void {
    this.niveauxFiltres = this.niveauxTous.filter(n =>
      n.codeCursus && n.codeCursus.includes(idCursus)
    );
    this.ref.getFilieres(idCursus, codeNiveau || '*').subscribe({
      next: (data) => { this.domainesFiltres = data.filter(f => !f.annuler); },
      error: () => { this.domainesFiltres = []; }
    });
  }

  onNiveauChange(event: Event): void {
    const codeNiveau = (event.target as HTMLSelectElement).value;
    const idCursus = this.form.get('cursus')?.value;
    this.form.get('domaineFormation')?.setValue('');
    if (idCursus && codeNiveau) {
      this.ref.getFilieres(idCursus, codeNiveau).subscribe({
        next: (data) => { this.domainesFiltres = data.filter(f => !f.annuler); },
        error: () => { this.domainesFiltres = []; }
      });
      this.ref.getDiplomes(idCursus, codeNiveau).subscribe({
        next: (data) => { this.diplomesAdmission = data.filter(d => !d.annuler); },
        error: () => {}
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
      this.form.get('imageRecu')?.setValue(reader.result as string);
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
    this.autosave.saveNow('enstmo_specialisation', { ...this.form.value, imageNom: this.imageNom });
    localStorage.setItem('enstmo_current_step', '3');
    this.router.navigate(['/inscription/cursus']);
  }

  onBack(): void { this.router.navigate(['/inscription/identification']); }
}
