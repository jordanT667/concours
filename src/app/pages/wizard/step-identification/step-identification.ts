import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SITUATIONS_MATRIMONIALES } from '../../../core/models/geo.constants';
import { STORAGE_KEYS } from '../../../core/services/storage';
import { ConcoursReferenceService } from '../../../core/services/concours-reference.service';
import { PaysDto } from '../../../core/models/pays.models';
import { RegionDto, DepartementDto, LangueDto } from '../../../core/models/referentiel.models';
import { LoggerService } from '../../../core/services/logger.service';
import { AutosaveService, AutosaveStatus } from '../../../core/services/autosave.service';
import { AutosaveIndicator } from '../../../shared/autosave-indicator/autosave-indicator';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-step-identification',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AutosaveIndicator],
  templateUrl: './step-identification.html',
  styleUrl: './step-identification.css'
})
export class StepIdentification implements OnInit, OnDestroy {

  form!: FormGroup;

  situationsMatrimoniales = SITUATIONS_MATRIMONIALES;

  pays: PaysDto[] = [];
  langues: LangueDto[] = [];
  regions: RegionDto[] = [];
  departementsFiltres: DepartementDto[] = [];

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
    this.buildForm();
    this.chargerDonneesReference();
    this.restoreFromStorage();
    this.formSub = this.form.valueChanges.subscribe(val => {
      if (this.form.dirty) {
        this.autosave.schedule(STORAGE_KEYS.IDENTIFICATION, val);
      }
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  private chargerDonneesReference(): void {
    this.chargement = true;
    this.erreurChargement = '';

    this.ref.getPays().subscribe({
      next: (data) => { this.pays = data; },
      error: () => { this.erreurChargement = 'Impossible de charger la liste des pays.'; }
    });

    this.ref.getLangues().subscribe({
      next: (data) => { this.langues = data; },
      error: () => { this.erreurChargement = 'Impossible de charger les langues.'; }
    });

    this.ref.getRegions('CMR').subscribe({
      next: (data) => {
        this.regions = data;
        this.chargement = false;
      },
      error: () => {
        this.erreurChargement = 'Impossible de charger les régions.';
        this.chargement = false;
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', Validators.required],
      sexe: ['M', Validators.required],
      dateNaissance: ['', Validators.required],
      lieuNaissance: ['', Validators.required],
      situationMatrimoniale: ['Célibataire', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      numeroCNI: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      premiereLangue: ['', Validators.required],
      deuxiemeLangue: ['', Validators.required],
      paysNationalite: ['', Validators.required],
      regionOrigine: [''],
      departementOrigine: [''],
    });
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const saved = localStorage.getItem(STORAGE_KEYS.IDENTIFICATION);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      this.form.patchValue(data);
      if (data.regionOrigine) {
        this.chargerDepartements(data.regionOrigine);
      }
    } catch (e) {
      this.logger.error('Erreur lecture localStorage', e);
    }
  }

  onRegionChange(event: Event): void {
    const saisie = (event.target as HTMLInputElement).value.trim();
    this.form.get('departementOrigine')?.setValue('');
    this.departementsFiltres = [];

    const region = this.regions.find(
      r => r.libelleRegionLangue1.toLowerCase() === saisie.toLowerCase()
        || r.libelleRegionLangue2?.toLowerCase() === saisie.toLowerCase()
        || r.codeRegion.toLowerCase() === saisie.toLowerCase()
    );

    if (region) {
      this.chargerDepartements(region.codeRegion);
    }
  }

  private chargerDepartements(codeRegion: string): void {
    this.ref.getDepartements(codeRegion).subscribe({
      next: (data) => { this.departementsFiltres = data; },
      error: () => { this.departementsFiltres = []; }
    });
  }

  get f() { return this.form.controls; }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.autosave.saveNow(STORAGE_KEYS.IDENTIFICATION, this.form.value);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, '2');
    this.router.navigate(['/inscription/specialisation']);
  }

  onBack(): void {
    this.router.navigate(['/inscription/recommandation']);
  }
}
