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

  autosaveStatus$!: Observable<AutosaveStatus>;
  private formSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ref: ConcoursReferenceService,
    private logger: LoggerService,
    private autosave: AutosaveService
  ) { }

  ngOnInit(): void {
    this.autosaveStatus$ = this.autosave.status$;
    this.buildForm();
    this.chargerDonneesReference();
    this.restoreFromStorage();
    this.formSub = this.form.valueChanges.subscribe(val => {
      if (this.form.dirty) this.autosave.schedule('enstmo_contacts', val);
    });
  }

  private chargerDonneesReference(): void {
    this.ref.getLoisirs().subscribe({
      next: (data) => { this.loisirOptions = data.filter(l => !l.annuler); },
      error: () => {}
    });
    this.ref.getSports().subscribe({
      next: (data) => { this.sportOptions = data.filter(s => !s.annuler); },
      error: () => {}
    });
    this.ref.getHandicaps().subscribe({
      next: (data) => { this.handicapOptions = data.filter(h => !h.annuler); },
      error: () => {}
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
      nomPere: ['', Validators.required],
      nomMere: ['', Validators.required],
      telPere: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      emailPere: ['', Validators.email],
      telMere: ['', Validators.pattern(/^[0-9]{9}$/)],
    });
  }

  private restoreFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('enstmo_contacts');
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

  onLoisirChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.logger.log('Loisir selectionné:', val);
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
    this.autosave.saveNow('enstmo_contacts', this.form.value);
    if (typeof window !== 'undefined') localStorage.setItem('enstmo_current_step', '5');
    this.router.navigate(['/inscription/finish']);
  }

  onBack(): void {
    this.router.navigate(['/inscription/cursus']);
  }
}
