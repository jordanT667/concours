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
  selector: 'app-step-specialisation',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './step-specialisation.html',
  styleUrl: './step-specialisation.css'
})
export class StepSpecialisation implements OnInit {

  form!: FormGroup;

  // ── Aperçu image uploadée ────────────────────────────────────────────
  imagePreview: string | null = null;
  imageNom: string = '';
  imageErreur: string = '';

  // ── Années dynamiques ────────────────────────────────────────────────
  anneesCourantes: number[] = [];
  anneesBEPC: number[] = [];

  // ── Données des listes ───────────────────────────────────────────────
  cursusOptions = ['Ingénierie', 'Technologie', 'Sciences', 'Gestion'];

  niveauxParCursus: Record<string, string[]> = {
    'Ingénierie': ['L1', 'L3', 'M1', 'M2'],
    'Technologie': ['L1', 'L3', 'M1', 'M2'],
    'Sciences_de_Ingenieur': ['L1', 'L2', 'L 3'],

  };
  niveauxFiltres: string[] = [];

  domainesParCursus: Record<string, string[]> = {
    'Ingénierie': ['Génie Informatique', 'Génie Civil', 'Génie Électrique', 'Génie Mécanique'],
    'Technologie': ['Informatique', 'Électronique', 'Maintenance Industrielle'],
    'Sciences': ['Mathématiques', 'Physique', 'Chimie', 'Biologie'],

  };
  domainesFiltres: string[] = [];

  diplomesAdmission = ['Baccalauréat', 'GCE A/Level', 'BTS', 'HND', 'Licence', 'Master'];

  seriesParDiplome: Record<string, string[]> = {
    'Baccalauréat': ['A', 'B', 'C', 'D', 'E', 'F', 'TI', 'TMT', 'TSGE'],
    'GCE A/Level': ['Sciences', 'Arts', 'Commercial', 'Technical'],
    'BTS': ['Informatique', 'Finance', 'Commerce', 'Maintenance'],
    'HND': ['Informatique', 'Finance', 'Commerce', 'Maintenance'],
    'Licence': ['Informatique', 'Mathématiques', 'Gestion', 'Droit'],
    'Master': ['Informatique', 'Gestion', 'Sciences'],
  };
  seriesFiltrees: string[] = [];

  mentionsOptions = ['Passable', 'Assez Bien', 'Bien', 'Très Bien'];
  paysOptions = ['Cameroun', 'Nigeria', 'Tchad', 'Centrafrique', 'Gabon', 'Congo', "Côte d'Ivoire", 'France', 'Autre'];
  centresConcours = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea'];
  centresDepot = ['ENSTMO Yaoundé', 'Délégation Douala', 'Délégation Bafoussam', 'Délégation Bamenda', 'Délégation Garoua', 'Délégation Maroua'];
  banquesOptions = ['CCA Bank'];
  epreuvesOptions = ['RAS', 'Mathématiques', 'Physique', 'Informatique', 'Français', 'Anglais'];

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.genererAnnees();
    this.buildForm();
    this.restoreFromStorage();
  }

  private genererAnnees(): void {
    const an = new Date().getFullYear();
    for (let a = an; a >= an - 15; a--) this.anneesCourantes.push(a);
    for (let a = an; a >= an - 20; a--) this.anneesBEPC.push(a);
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
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('enstmo_specialisation');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.form.patchValue(data);
          if (data.cursus) {
            this.niveauxFiltres = this.niveauxParCursus[data.cursus] || [];
            this.domainesFiltres = this.domainesParCursus[data.cursus] || [];
          }
          if (data.diplomeAdmission) {
            this.seriesFiltrees = this.seriesParDiplome[data.diplomeAdmission] || [];
          }
          if (data.imageRecu) {
            this.imagePreview = data.imageRecu;
            this.imageNom = data.imageNom || '';
          }
        } catch (e) { console.error('Erreur localStorage', e); }
      }
    }
  }

  onCursusChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.niveauxFiltres = this.niveauxParCursus[v] || [];
    this.domainesFiltres = this.domainesParCursus[v] || [];
    this.form.get('niveau')?.setValue('');
    this.form.get('domaineFormation')?.setValue('');
  }

  onDiplomeChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.seriesFiltrees = this.seriesParDiplome[v] || [];
    this.form.get('serieDiplome')?.setValue('');
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageErreur = '';
    if (!input.files || !input.files.length) return;
    const fichier = input.files[0];

    if (fichier.size > 2 * 1024 * 1024) {
      this.imageErreur = 'Fichier trop lourd. Maximum 2 Mo.'; return;
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
    localStorage.setItem('enstmo_specialisation', JSON.stringify({ ...this.form.value, imageNom: this.imageNom }));
    localStorage.setItem('enstmo_current_step', '3');
    this.router.navigate(['/inscription/cursus']);
  }

  onBack(): void { this.router.navigate(['/inscription/identification']); }
}