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

  loisirOptions = ['Voyage', 'Lecture', 'Musique', 'Cinéma', 'Cuisine', 'Jardinage', 'Peinture', 'Photographie'];
  sportOptions = ['FootBall', 'Basketball', 'Tennis', 'Natation', 'Volleyball', 'Athlétisme', 'Cyclisme', 'Arts martiaux'];
  handicapOptions = ['NON', 'OUI'];
  professionOptions = ['NON', 'Enseignant', 'Médecin', 'Ingénieur', 'Avocat', 'Commerçant', 'Autre'];

  autosaveStatus$!: Observable<AutosaveStatus>;
  private formSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private logger: LoggerService,
    private autosave: AutosaveService
  ) { }

  ngOnInit(): void {
    this.autosaveStatus$ = this.autosave.status$;
    this.buildForm();
    this.restoreFromStorage();
    this.formSub = this.form.valueChanges.subscribe(val => {
      if (this.form.dirty) this.autosave.schedule('enstmo_contacts', val);
    });
  }

  ngOnDestroy(): void { this.formSub?.unsubscribe(); }

  private buildForm(): void {
    this.form = this.fb.group({
      loisir1: ['Voyage', Validators.required],
      loisir2: ['Voyage'],
      activite1: ['FootBall', Validators.required],
      activite2: ['FootBall'],
      handicap: ['NON', Validators.required],
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
