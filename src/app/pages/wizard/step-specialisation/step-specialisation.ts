import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConcoursReferenceService } from '../../../core/services/concours-reference.service';
import { PaysDto } from '../../../core/models/pays.models';
import { CursusDto, NiveauDto, DiplomeDto, FiliereDto } from '../../../core/models/referentiel.models';

@Component({
  selector: 'app-step-specialisation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './step-specialisation.html',
  styleUrl: './step-specialisation.css'
})
export class StepSpecialisation implements OnInit {

  form!: FormGroup;

  imagePreview: string | null = null;
  imageNom: string = '';
  imageErreur: string = '';

  anneesCourantes: number[] = [];
  anneesBEPC: number[] = [];

  // Données chargées depuis l'API
  cursusOptions: CursusDto[] = [];
  niveauxTous: NiveauDto[] = [];
  niveauxFiltres: NiveauDto[] = [];
  domainesFiltres: FiliereDto[] = [];
  diplomesAdmission: DiplomeDto[] = [];
  paysOptions: PaysDto[] = [];

  // Séries : restent en dur car non gérées en base
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
  centresConcours = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea'];
  centresDepot = ['ENSTMO Yaoundé', 'Délégation Douala', 'Délégation Bafoussam', 'Délégation Bamenda', 'Délégation Garoua', 'Délégation Maroua'];
  banquesOptions = ['CCA Bank'];
  epreuvesOptions = ['RAS', 'Mathématiques', 'Physique', 'Informatique', 'Français', 'Anglais'];

  chargement = false;
  erreurChargement = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ref: ConcoursReferenceService
  ) {}

  ngOnInit(): void {
    this.genererAnnees();
    this.buildForm();
    this.chargerDonneesReference();
  }

  private genererAnnees(): void {
    const an = new Date().getFullYear();
    for (let a = an; a >= an - 15; a--) this.anneesCourantes.push(a);
    for (let a = an; a >= an - 20; a--) this.anneesBEPC.push(a);
  }

  private chargerDonneesReference(): void {
    this.chargement = true;

    this.ref.getCursus().subscribe({
      next: (data) => { this.cursusOptions = data.filter(c => !c.annuler); },
      error: () => { this.erreurChargement = 'Impossible de charger les cursus.'; }
    });

    this.ref.getNiveaux().subscribe({
      next: (data) => { this.niveauxTous = data; },
      error: () => { this.erreurChargement = 'Impossible de charger les niveaux.'; }
    });

    this.ref.getPays().subscribe({
      next: (data) => { this.paysOptions = data; },
      error: () => { this.erreurChargement = 'Impossible de charger les pays.'; }
    });

    this.ref.getDiplomes().subscribe({
      next: (data) => {
        this.diplomesAdmission = data.filter(d => !d.annuler);
        this.chargement = false;
        this.restoreFromStorage();
      },
      error: () => {
        this.erreurChargement = 'Impossible de charger les diplômes.';
        this.chargement = false;
      }
    });
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
    if (typeof window === 'undefined' || !window.localStorage) return;
    const saved = localStorage.getItem('enstmo_specialisation');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      this.form.patchValue(data);
      if (data.cursus) {
        this.filtrerNiveauxEtFilieres(data.cursus, data.niveau);
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

  onCursusChange(event: Event): void {
    const idCursus = (event.target as HTMLSelectElement).value;
    this.form.get('niveau')?.setValue('');
    this.form.get('domaineFormation')?.setValue('');
    this.niveauxFiltres = [];
    this.domainesFiltres = [];
    if (idCursus) {
      this.filtrerNiveauxEtFilieres(idCursus, '');
      this.ref.getDiplomes(idCursus).subscribe({
        next: (data) => { this.diplomesAdmission = data.filter(d => !d.annuler); },
        error: () => {}
      });
    }
  }

  private filtrerNiveauxEtFilieres(idCursus: string, codeNiveau: string): void {
    this.niveauxFiltres = this.niveauxTous.filter(n =>
      n.codeCursus && n.codeCursus.includes(idCursus)
    );
    this.ref.getFilieres(idCursus, codeNiveau || '*').subscribe({
      next: (data) => { this.domainesFiltres = data.filter(f => !f.annuler); },
      error: () => { this.domainesFiltres = []; }
    });
  }

  onNiveauChange(event: Event): void {
    const codeNiveau = (event.target as HTMLSelectElement).value;
    const idCursus = this.form.get('cursus')?.value;
    this.form.get('domaineFormation')?.setValue('');
    if (idCursus && codeNiveau) {
      this.ref.getFilieres(idCursus, codeNiveau).subscribe({
        next: (data) => { this.domainesFiltres = data.filter(f => !f.annuler); },
        error: () => { this.domainesFiltres = []; }
      });
      this.ref.getDiplomes(idCursus, codeNiveau).subscribe({
        next: (data) => { this.diplomesAdmission = data.filter(d => !d.annuler); },
        error: () => {}
      });
    }
  }

  onDiplomeChange(event: Event): void {
    const libelle = (event.target as HTMLSelectElement).value;
    this.seriesFiltrees = this.seriesParDiplome[libelle] || [];
    this.form.get('serieDiplome')?.setValue('');
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageErreur = '';
    if (!input.files || !input.files.length) return;
    const fichier = input.files[0];
    if (fichier.size > 2 * 1024 * 1024) {
      this.imageErreur = 'Fichier trop lourd. Maximum 2 Mo.';
      return;
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
