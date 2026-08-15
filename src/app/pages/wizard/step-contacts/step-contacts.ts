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
import { ReferenceCacheService } from '../../../core/services/reference-cache.service';
import { STORAGE_KEYS } from '../../../core/services/storage';
import { LoisirDto, SportDto, HandicapDto } from '../../../core/models/referentiel.models';
import { LoggerService } from '../../../core/services/logger.service';
import { AutosaveService, AutosaveStatus } from '../../../core/services/autosave.service';
import { AutosaveIndicator } from '../../../shared/autosave-indicator/autosave-indicator';

@Component({
  selector: 'app-step-contacts',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AutosaveIndicator],
  templateUrl: './step-contacts.html',
  styleUrl: './step-contacts.css',
})
export class StepContacts implements OnInit, OnDestroy {
  form!: FormGroup;

  loisirOptions: LoisirDto[] = [];
  sportOptions: SportDto[] = [];
  handicapOptions: HandicapDto[] = [];
  professionOptions = ['NON', 'Enseignant', 'Médecin', 'Ingénieur', 'Avocat', 'Commerçant', 'Autre'];

  erreurChargement = '';

  autosaveStatus$!: Observable<AutosaveStatus>;
  private formSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private refCache: ReferenceCacheService,
    private logger: LoggerService,
    private autosave: AutosaveService
  ) { }

  ngOnInit(): void {
    this.autosaveStatus$ = this.autosave.status$;
    this.buildForm();
    this.chargerDonneesReference();
    this.restoreFromStorage();
    this.formSub = this.form.valueChanges.subscribe(val => {
      if (this.form.dirty) this.autosave.schedule(STORAGE_KEYS.CONTACTS, val);
    });
  }

  private chargerDonneesReference(): void {
    this.refCache.getLoisirs().subscribe({
      next: (data) => { this.loisirOptions = data.filter(l => !l.annuler); },
      error: () => { this.erreurChargement = 'Impossible de charger les loisirs.'; }
    });
    this.refCache.getSports().subscribe({
      next: (data) => { this.sportOptions = data.filter(s => !s.annuler); },
      error: () => { this.erreurChargement = 'Impossible de charger les sports.'; }
    });
    this.refCache.getHandicaps().subscribe({
      next: (data) => { this.handicapOptions = data.filter(h => !h.annuler); },
      error: () => { this.erreurChargement = 'Impossible de charger les handicaps.'; }
    });
  }

  ngOnDestroy(): void { this.formSub?.unsubscribe(); }

  private buildForm(): void {
    this.form = this.fb.group({
      loisir1: ['', Validators.required],
      loisir2: [''],
      activite1: ['', Validators.required],
      activite2: [''],
      handicap: [''],
      profession: ['NON', Validators.required],
      descriptionActiviteProf: [''],
      nomPere: ['', Validators.required],
      telPere: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      nomMere: ['', Validators.required],
      telMere: ['', Validators.pattern(/^[0-9]{9}$/)],
      nomPersonneContact: ['', Validators.required],
      telPersonneContact: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      emailPersonneContact: ['', Validators.email],
    });
  }

  private restoreFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.form.patchValue(data);
        } catch (e) {
          this.logger.error('Erreur lecture localStorage contacts', e);
        }
      }
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  get f() {
    return this.form.controls;
  }

  onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.autosave.saveNow(STORAGE_KEYS.CONTACTS, this.form.value);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, '5');
    this.router.navigate(['/inscription/finish']);
  }

  onBack(): void {
    this.router.navigate(['/inscription/cursus']);
  }
}
