import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type StatutDossier = 'SOUMISE' | 'EN_COURS_VERIFICATION' | 'VALIDEE' | 'REJETEE';

interface SuiviDossier {
  numeroDossier: string;
  nomComplet: string;
  filiere: string;
  centre: string;
  statut: StatutDossier;
  dateInscription: string;
  dateValidation?: string;
  motifRejet?: string;
}

@Component({
  selector: 'app-suivi',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './suivi.html',
  styleUrl: './suivi.css'
})
export class Suivi {
  form: FormGroup;
  dossier: SuiviDossier | null = null;
  chargement = false;
  erreur = '';

  readonly etapes: { statut: StatutDossier; label: string; desc: string }[] = [
    { statut: 'SOUMISE',               label: 'Dossier soumis',        desc: 'Votre dossier a été reçu avec succès.' },
    { statut: 'EN_COURS_VERIFICATION', label: 'Vérification en cours', desc: 'Un agent examine votre dossier.' },
    { statut: 'VALIDEE',               label: 'Dossier validé',        desc: 'Votre inscription est confirmée.' },
    { statut: 'REJETEE',               label: 'Dossier rejeté',        desc: 'Votre dossier n\'a pas été retenu.' },
  ];

  private readonly ORDRE: Record<StatutDossier, number> = {
    SOUMISE: 0, EN_COURS_VERIFICATION: 1, VALIDEE: 2, REJETEE: 2
  };

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      numeroDossier: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  rechercher(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.chargement = true;
    this.erreur = '';
    this.dossier = null;
    const { numeroDossier, email } = this.form.value;
    this.http.get<SuiviDossier>(
      `${environment.apiUrl}/inscriptions/suivi?numeroDossier=${encodeURIComponent(numeroDossier)}&email=${encodeURIComponent(email)}`
    ).subscribe({
      next: data => { this.dossier = data; this.chargement = false; },
      error: err  => {
        this.chargement = false;
        this.erreur = err.status === 404
          ? 'Aucun dossier trouvé avec ces informations.'
          : 'Erreur lors de la recherche. Veuillez réessayer.';
      }
    });
  }

  etapeActive(statut: StatutDossier): boolean {
    if (!this.dossier) return false;
    return this.ORDRE[statut] <= this.ORDRE[this.dossier.statut];
  }

  etapeCourante(statut: StatutDossier): boolean {
    return this.dossier?.statut === statut;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
