import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ConcoursReferenceService } from '../../../core/services/concours-reference.service';
import { DiplomeDto, MentionDto } from '../../../core/models/referentiel.models';
import { LoggerService } from '../../../core/services/logger.service';
import { AutosaveService, AutosaveStatus } from '../../../core/services/autosave.service';
import { AutosaveIndicator } from '../../../shared/autosave-indicator/autosave-indicator';

export interface Diplome {
  annee: number;
  etablissement: string;
  diplome: string;
  mention: string;
}

@Component({
  selector: 'app-step-cursus',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AutosaveIndicator],
  templateUrl: './step-cursus.html',
  styleUrl: './step-cursus.css'
})
export class StepCursus implements OnInit {

  diplomes: Diplome[] = [];
  showModal = false;
  modalForm!: FormGroup;
  erreurGlobale = '';
  erreurModal = '';
  readonly maxDiplomes = 3;

  annees: number[] = [];
  diplomesOptions: DiplomeDto[] = [];
  mentionsOptions: MentionDto[] = [];

  autosaveStatus$!: Observable<AutosaveStatus>;

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
    this.buildModalForm();
    this.chargerDiplomes();
    this.chargerMentions();
    this.restoreFromStorage();
  }

  private chargerDiplomes(): void {
    this.ref.getDiplomes().subscribe({
      next: (data) => { this.diplomesOptions = data.filter(d => !d.annuler); },
      error: () => {}
    });
  }

  private chargerMentions(): void {
    this.ref.getMentions().subscribe({
      next: (data) => { this.mentionsOptions = data; },
      error: () => {}
    });
  }

  private genererAnnees(): void {
    this.ref.getAnnees(30).subscribe({
      next: (data) => { this.annees = data; },
      error: () => {
        const an = new Date().getFullYear();
        for (let a = an; a >= an - 30; a--) this.annees.push(a);
      }
    });
  }

  private buildModalForm(): void {
    const an = new Date().getFullYear();
    this.modalForm = this.fb.group({
      annee: [an, Validators.required],
      etablissement: ['', Validators.required],
      diplome: ['', Validators.required],
      mention: ['', Validators.required],
    });
  }

  private restoreFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('enstmo_cursus');
      if (saved) {
        try {
          this.diplomes = JSON.parse(saved);
        } catch (e) {
          this.logger.error('Erreur localStorage', e);
        }
      }
    }
  }

  ouvrirModal(): void {
    this.buildModalForm();
    this.erreurModal = '';
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
  }

  sauvegarderDiplome(): void {
    if (this.modalForm.invalid) {
      this.modalForm.markAllAsTouched();
      return;
    }
    const nouveau: Diplome = this.modalForm.value;
    const erreur = this.validerNouveauDiplome(nouveau);
    if (erreur) {
      this.erreurModal = erreur;
      return;
    }
    this.diplomes.push(nouveau);
    this.diplomes.sort((a, b) => b.annee - a.annee);
    this.erreurGlobale = '';
    this.erreurModal = '';
    this.fermerModal();
    this.sauvegarderEnLocal();
  }

  private validerNouveauDiplome(candidat: Diplome): string {
    if (this.diplomes.length >= this.maxDiplomes) {
      return `Vous ne pouvez pas ajouter plus de ${this.maxDiplomes} diplômes.`;
    }
    const memeDiplome = this.diplomes.some(
      d => d.diplome.toLowerCase() === candidat.diplome.toLowerCase()
    );
    if (memeDiplome) {
      return `Le diplôme "${candidat.diplome}" a déjà été renseigné.`;
    }
    const memeAnnee = this.diplomes.some(d => Number(d.annee) === Number(candidat.annee));
    if (memeAnnee) {
      return `L'année ${candidat.annee} est déjà associée à un autre diplôme.`;
    }
    return '';
  }

  supprimerDerniereLigne(): void {
    if (this.diplomes.length > 0) {
      this.diplomes.pop();
      this.sauvegarderEnLocal();
    }
  }

  supprimerDiplome(index: number): void {
    this.diplomes.splice(index, 1);
    this.sauvegarderEnLocal();
  }

  private sauvegarderEnLocal(): void {
    this.autosave.saveNow('enstmo_cursus', this.diplomes);
  }

  get mf() { return this.modalForm.controls; }

  get peutAjouterDiplome(): boolean {
    return this.diplomes.length < this.maxDiplomes;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.modalForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.fermerModal();
    }
  }

  onNext(): void {
    if (this.diplomes.length < 1) {
      this.erreurGlobale = 'Vous devez renseigner au moins 1 diplôme de votre parcours scolaire.';
      return;
    }
    this.sauvegarderEnLocal();
    localStorage.setItem('enstmo_current_step', '4');
    this.router.navigate(['/inscription/contacts']);
  }

  onBack(): void {
    this.router.navigate(['/inscription/specialisation']);
  }
}
