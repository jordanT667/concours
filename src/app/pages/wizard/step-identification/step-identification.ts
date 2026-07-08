import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SITUATIONS_MATRIMONIALES } from '../../../core/models/geo.constants';
import { STORAGE_KEYS } from '../../../core/services/storage';
import { ConcoursReferenceService } from '../../../core/services/concours-reference.service';
import { PaysDto } from '../../../core/models/pays.models';
import { RegionDto, DepartementDto, LangueDto } from '../../../core/models/referentiel.models';

@Component({
  selector: 'app-step-identification',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './step-identification.html',
  styleUrl: './step-identification.css'
})
export class StepIdentification implements OnInit {

  form!: FormGroup;

  situationsMatrimoniales = SITUATIONS_MATRIMONIALES;

  // Données chargées depuis l'API
  pays: PaysDto[] = [];
  langues: LangueDto[] = [];
  regions: RegionDto[] = [];
  departementsFiltres: DepartementDto[] = [];

  chargement = false;
  erreurChargement = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ref: ConcoursReferenceService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.chargerDonneesReference();
    this.restoreFromStorage();
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
      prenom: [''],
      sexe: ['Masculin', Validators.required],
      dateNaissance: ['', Validators.required],
      lieuNaissance: ['', Validators.required],
      situationMatrimoniale: ['Célibataire', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      numeroCNI: ['', Validators.required],
      email: ['', [Validators.email]],
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
      console.error('Erreur lecture localStorage', e);
    }
  }

  onRegionChange(event: Event): void {
    const saisie = (event.target as HTMLInputElement).value.trim();
    this.form.get('departementOrigine')?.setValue('');
    this.departementsFiltres = [];

    // Cherche si la valeur saisie correspond à une région connue (libellé ou code)
    const region = this.regions.find(
      r => r.libelleRegionLangue1.toLowerCase() === saisie.toLowerCase()
        || r.libelleRegionLangue2?.toLowerCase() === saisie.toLowerCase()
        || r.codeRegion.toLowerCase() === saisie.toLowerCase()
    );

    if (region) {
      this.chargerDepartements(region.codeRegion);
    }
    // Si saisie libre non reconnue, on laisse le champ libre sans département suggéré
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
    localStorage.setItem(STORAGE_KEYS.IDENTIFICATION, JSON.stringify(this.form.value));
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, '2');
    this.router.navigate(['/inscription/specialisation']);
  }

  onBack(): void {
    this.router.navigate(['/inscription/recommandation']);
  }
}
