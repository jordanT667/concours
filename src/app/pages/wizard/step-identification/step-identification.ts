import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-step-identification',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './step-identification.html',
  styleUrl: './step-identification.css'
})
export class StepIdentification implements OnInit {


  form!: FormGroup;


  situationsMatrimoniales = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'];

  langues = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand', 'Portugais', 'Haoussa', 'Fulfuldé', 'Ewondo'];

  pays = [
    'Cameroun', 'Nigeria', 'Tchad', 'République Centrafricaine',
    'Guinée Équatoriale', 'Gabon', 'Congo', 'RD Congo',
    'Côte d\'Ivoire', 'Sénégal', 'Mali', 'France', 'Autre'
  ];

  regions = [
    'Adamaoua', 'Centre', 'Est', 'Extrême-Nord',
    'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
  ];


  departements: Record<string, string[]> = {
    'Adamaoua': ['Djerem', 'Faro-et-Déo', 'Mayo-Banyo', 'Mbéré', 'Vina'],
    'Centre': ['Haute-Sanaga', 'Lekié', 'Mbam-et-Inoubou', 'Mbam-et-Kim', 'Méfou-et-Afamba', 'Méfou-et-Akono', 'Mfoundi', 'Nyong-et-Kellé', 'Nyong-et-Mfoumou', 'Nyong-et-So\'o'],
    'Est': ['Boumba-et-Ngoko', 'Haut-Nyong', 'Kadey', 'Lom-et-Djérem'],
    'Extrême-Nord': ['Diamaré', 'Logone-et-Chari', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava', 'Mayo-Tsanaga'],
    'Littoral': ['Moungo', 'Nkam', 'Sanaga-Maritime', 'Wouri'],
    'Nord': ['Bénoué', 'Faro', 'Mayo-Louti', 'Mayo-Rey'],
    'Nord-Ouest': ['Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Mezam', 'Momo', 'Ngo-Ketunjia'],
    'Ouest': ['Bamboutos', 'Haut-Nkam', 'Hauts-Plateaux', 'Koung-Khi', 'Menoua', 'Mifi', 'Nde', 'Noun'],
    'Sud': ['Dja-et-Lobo', 'Mvila', 'Océan', 'Vallée-du-Ntem'],
    'Sud-Ouest': ['Fako', 'Koupé-Manengouba', 'Lebialem', 'Manyu', 'Meme', 'Ndian'],
  };

  // Départements filtrés selon la région choisie
  departementsFiltres: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.restoreFromStorage();
  }

  // Construction du formulaire //
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

  // ── Restaurer depuis localStorage//
  private restoreFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('enstmo_identification');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.form.patchValue(data);
          // Recharger les départements si une région était sélectionnée
          if (data.regionOrigine) {
            this.departementsFiltres = this.departements[data.regionOrigine] || [];
          }
        } catch (e) {
          console.error('Erreur lecture localStorage', e);
        }
      }
    }
  }

  // Mise à jour des départements quand la région change //
  onRegionChange(event: Event): void {
    const region = (event.target as HTMLSelectElement).value;
    this.departementsFiltres = this.departements[region] || [];
    this.form.get('departementOrigine')?.setValue('');
  }

  // Getter pour accéder facilement aux contrôles dans le template //
  get f() {
    return this.form.controls;
  }

  // Vérifier si un champ est invalide et a été touché //
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  // Soumission : sauvegarder et passer à l'étape suivante //
  onNext(): void {
    if (this.form.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.form.markAllAsTouched();
      return;
    }
    // Sauvegarder dans localStorage
    localStorage.setItem('enstmo_identification', JSON.stringify(this.form.value));
    localStorage.setItem('enstmo_current_step', '2');
   
    this.router.navigate(['/inscription/specialisation']);
  }

  onBack(): void {
    this.router.navigate(['/inscription/recommandation']);
  }
}
