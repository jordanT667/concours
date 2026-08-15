import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { SITUATIONS_MATRIMONIALES } from '../../../core/models/geo.constants';
import { STORAGE_KEYS } from '../../../core/services/storage';
import { ReferenceCacheService } from '../../../core/services/reference-cache.service';
import { ConcoursReferenceService } from '../../../core/services/concours-reference.service';
import { PaysDto } from '../../../core/models/pays.models';
import { RegionDto, DepartementDto, LangueDto } from '../../../core/models/referentiel.models';
import { LoggerService } from '../../../core/services/logger.service';
import { AutosaveService, AutosaveStatus } from '../../../core/services/autosave.service';
import { AutosaveIndicator } from '../../../shared/autosave-indicator/autosave-indicator';

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

  isCameroun = false;

  chargement = false;
  erreurChargement = '';

  autosaveStatus$!: Observable<AutosaveStatus>;

  private formSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private refCache: ReferenceCacheService,
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

    this.refCache.getPays().subscribe({
      next: (data) => { this.pays = data; },
      error: () => { this.erreurChargement = 'Impossible de charger la liste des pays.'; }
    });

    this.refCache.getLangues().subscribe({
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
      dateNaissance: ['', [Validators.required, this.validateAge]],
      lieuNaissance: ['', Validators.required],
      situationMatrimoniale: ['Célibataire', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      numeroCNI: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      premiereLangue: ['', Validators.required],
      deuxiemeLangue: ['', Validators.required],
      paysNationalite: ['', Validators.required],
      regionOrigine: [''],
      departementOrigine: [''],
    }, { validators: [this.languesDifferentes, this.emailsIdentiques] });
  }

  private validateAge(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const birth = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 15) return { tooYoung: true };
    if (age > 50) return { tooOld: true };
    return null;
  }

  private languesDifferentes(group: AbstractControl): ValidationErrors | null {
    const l1 = group.get('premiereLangue')?.value;
    const l2 = group.get('deuxiemeLangue')?.value;
    if (l1 && l2 && l1 === l2) return { languesIdentiques: true };
    return null;
  }

  private emailsIdentiques(group: AbstractControl): ValidationErrors | null {
    const e1 = group.get('email')?.value;
    const e2 = group.get('confirmEmail')?.value;
    if (e1 && e2 && e1.toLowerCase() !== e2.toLowerCase()) return { emailsMismatch: true };
    return null;
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const saved = localStorage.getItem(STORAGE_KEYS.IDENTIFICATION);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      this.form.patchValue(data);
      this.isCameroun = data.paysNationalite === 'CMR';
      if (this.isCameroun && data.regionOrigine) {
        const region = this.regions.find(
          r => r.codeRegion === data.regionOrigine || r.libelleRegionLangue1 === data.regionOrigine
        );
        if (region) {
          this.chargerDepartements(region.codeRegion);
        }
      }
    } catch (e) {
      this.logger.error('Erreur lecture localStorage', e);
    }
  }

  onPaysChange(): void {
    const codePays = this.form.get('paysNationalite')?.value;
    this.isCameroun = codePays === 'CMR';

    this.form.get('regionOrigine')?.setValue('');
    this.form.get('departementOrigine')?.setValue('');
    this.departementsFiltres = [];

    if (this.isCameroun && this.regions.length === 0) {
      this.ref.getRegions('CMR').subscribe({
        next: (data) => { this.regions = data; },
        error: () => { this.erreurChargement = 'Impossible de charger les régions.'; }
      });
    }
  }

  onRegionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | HTMLInputElement).value;
    this.form.get('departementOrigine')?.setValue('');
    this.departementsFiltres = [];

    if (!this.isCameroun) return;

    const region = this.regions.find(
      r => r.codeRegion === value
        || r.libelleRegionLangue1?.toLowerCase() === value.toLowerCase()
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

  get languesErreur(): boolean {
    return this.form.hasError('languesIdentiques') &&
      (this.form.get('deuxiemeLangue')?.touched ?? false);
  }

  get emailErreur(): boolean {
    return this.form.hasError('emailsMismatch') &&
      (this.form.get('confirmEmail')?.touched ?? false);
  }

  onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = { ...this.form.value };
    delete val.confirmEmail;
    this.autosave.saveNow(STORAGE_KEYS.IDENTIFICATION, val);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, '2');
    this.router.navigate(['/inscription/specialisation']);
  }

  onBack(): void {
    this.router.navigate(['/inscription/recommandation']);
  }
}
