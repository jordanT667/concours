import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

// ── Interface d'un diplôme dans le tableau ───────────────────────────────────
export interface Diplome {
  annee: number;
  etablissement: string;
  diplome: string;
  mention: string;
}

@Component({
  selector: 'app-step-cursus',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './step-cursus.html',
  styleUrl: './step-cursus.css'
})
export class StepCursus implements OnInit {

  // ── Liste des diplômes ajoutés ───────────────────────────────────────
  diplomes: Diplome[] = [];

  // ── Contrôle d'affichage de la modale ───────────────────────────────
  showModal = false;

  // ── Formulaire de la modale ──────────────────────────────────────────
  modalForm!: FormGroup;

  // ── Erreur globale (minimum 3 diplômes) ─────────────────────────────
  erreurGlobale = '';

  // ── Erreur spécifique affichée dans la modale d'ajout ────────────────
  erreurModal = '';

  // ── Nombre maximum de diplômes autorisés ─────────────────────────────
  readonly maxDiplomes = 3;

  // ── Données des selects ──────────────────────────────────────────────
  annees: number[] = [];

  diplomesOptions = [
    'CEPE', 'BEPC', 'CAP', 'BEP',
    'Baccalauréat', 'GCE O/Level', 'GCE A/Level',
    'BTS', 'HND', 'DUT',
    'Licence', 'Licence Pro',
    'Master', 'Master Pro', 'DEA', 'DESS',
    'Doctorat', 'Ingénieur', 'Autre'
  ];

  mentionsOptions = ['Passable', 'Assez-bien', 'Bien', 'Très Bien', 'Excellent'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.genererAnnees();
    this.buildModalForm();
    this.restoreFromStorage();
  }

  // ── Générer les années ───────────────────────────────────────────────
  private genererAnnees(): void {
    const an = new Date().getFullYear();
    for (let a = an; a >= an - 30; a--) {
      this.annees.push(a);
    }
  }

  // ── Construire le formulaire de la modale ────────────────────────────
  private buildModalForm(): void {
    const an = new Date().getFullYear();
    this.modalForm = this.fb.group({
      annee: [an, Validators.required],
      etablissement: ['', Validators.required],
      diplome: ['Baccalauréat', Validators.required],
      mention: ['Assez-bien', Validators.required],
    });
  }

  // ── Restaurer depuis localStorage ────────────────────────────────────
  private restoreFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('enstmo_cursus');
      if (saved) {
        try {
          this.diplomes = JSON.parse(saved);
        } catch (e) {
          console.error('Erreur localStorage', e);
        }
      }
    }
  }

  // ── Ouvrir la modale ─────────────────────────────────────────────────
  ouvrirModal(): void {
    this.buildModalForm(); // reset du formulaire
    this.erreurModal = '';
    this.showModal = true;
  }

  // ── Fermer la modale ─────────────────────────────────────────────────
  fermerModal(): void {
    this.showModal = false;
  }

  // ── Sauvegarder un diplôme depuis la modale ──────────────────────────
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
    // Trier par année décroissante (le plus récent en premier)
    this.diplomes.sort((a, b) => b.annee - a.annee);
    this.erreurGlobale = '';
    this.erreurModal = '';
    this.fermerModal();
    this.sauvegarderEnLocal();
  }

  // ── Règles métier : max 3 diplômes, pas de diplôme en double,
  //    pas deux diplômes la même année ──────────────────────────────────
  private validerNouveauDiplome(candidat: Diplome): string {
    if (this.diplomes.length >= this.maxDiplomes) {
      return `Vous ne pouvez pas ajouter plus de ${this.maxDiplomes} diplômes.`;
    }

    const memeDiplome = this.diplomes.some(
      d => d.diplome.toLowerCase() === candidat.diplome.toLowerCase()
    );
    if (memeDiplome) {
      return `Le diplôme "${candidat.diplome}" a déjà été renseigné. Un même diplôme ne peut apparaître qu'une seule fois dans votre parcours.`;
    }

    const memeAnnee = this.diplomes.some(d => Number(d.annee) === Number(candidat.annee));
    if (memeAnnee) {
      return `L'année ${candidat.annee} est déjà associée à un autre diplôme. Une même année ne peut correspondre qu'à un seul diplôme.`;
    }

    return '';
  }

  // ── Supprimer la dernière ligne ───────────────────────────────────────
  supprimerDerniereLigne(): void {
    if (this.diplomes.length > 0) {
      this.diplomes.pop();
      this.sauvegarderEnLocal();
    }
  }

  // ── Supprimer un diplôme par index ───────────────────────────────────
  supprimerDiplome(index: number): void {
    this.diplomes.splice(index, 1);
    this.sauvegarderEnLocal();
  }

  // ── Sauvegarder la liste en localStorage ─────────────────────────────
  private sauvegarderEnLocal(): void {
    localStorage.setItem('enstmo_cursus', JSON.stringify(this.diplomes));
  }

  // ── Getter accès rapide aux contrôles de la modale ───────────────────
  get mf() { return this.modalForm.controls; }

  // ── Permet au template de désactiver/masquer le bouton "Ajouter" ─────
  get peutAjouterDiplome(): boolean {
    return this.diplomes.length < this.maxDiplomes;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.modalForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  // ── Fermer modale si clic en dehors ──────────────────────────────────
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.fermerModal();
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────
  onNext(): void {
    if (this.diplomes.length < this.maxDiplomes) {
      this.erreurGlobale = `Vous devez renseigner exactement ${this.maxDiplomes} diplômes de votre parcours scolaire.`;
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