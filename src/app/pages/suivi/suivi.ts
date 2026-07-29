import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PreinscriptionService } from '../../core/services/preinscription.service';
import { PreinscriptionDto } from '../../core/models/preinscription.models';

type EtatPreins = 'E' | 'S' | 'R';

@Component({
  selector: 'app-suivi',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './suivi.html',
  styleUrl: './suivi.css'
})
export class Suivi {
  form: FormGroup;
  dossier: PreinscriptionDto | null = null;
  chargement = false;
  erreur = '';

  readonly etapes: { etat: string; label: string; desc: string }[] = [
    { etat: 'E', label: 'Dossier soumis',        desc: 'Votre dossier a été reçu avec succès.' },
    { etat: 'V', label: 'Vérification en cours',  desc: 'Un agent examine votre dossier.' },
    { etat: 'S', label: 'Sélectionné',            desc: 'Votre inscription est confirmée.' },
    { etat: 'R', label: 'Rejeté',                 desc: 'Votre dossier n\'a pas été retenu.' },
  ];

  private readonly ORDRE: Record<string, number> = {
    E: 0, V: 1, S: 2, R: 2
  };

  constructor(private fb: FormBuilder, private preinscriptionService: PreinscriptionService) {
    this.form = this.fb.group({
      matricule: ['', Validators.required],
    });
  }

  rechercher(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.chargement = true;
    this.erreur = '';
    this.dossier = null;
    const { matricule } = this.form.value;
    this.preinscriptionService.getByMatricule(matricule).subscribe({
      next: data => { this.dossier = data; this.chargement = false; },
      error: err => {
        this.chargement = false;
        this.erreur = err.status === 404
          ? 'Aucun dossier trouvé avec ce matricule.'
          : 'Erreur lors de la recherche. Veuillez réessayer.';
      }
    });
  }

  get nomComplet(): string {
    if (!this.dossier) return '';
    return `${this.dossier.nom} ${this.dossier.prenom}`.trim();
  }

  get etatLabel(): string {
    const e = this.etapes.find(x => x.etat === this.dossier?.etatPreins);
    return e?.label ?? 'En attente';
  }

  etapeActive(etat: string): boolean {
    if (!this.dossier?.etatPreins) return false;
    return (this.ORDRE[etat] ?? 99) <= (this.ORDRE[this.dossier.etatPreins] ?? 0);
  }

  etapeCourante(etat: string): boolean {
    return this.dossier?.etatPreins === etat;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
