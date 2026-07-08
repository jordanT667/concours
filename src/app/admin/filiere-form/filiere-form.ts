import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Filiere, Departement } from '../../core/models/filiere.models';

@Component({
  selector: 'app-filiere-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filiere-form.html',
  styleUrl: './filiere-form.css'
})
export class FiliereFormComponent implements OnInit {

  @Input() filiere: Filiere | null = null;
  @Input() departements: Departement[] = [];
  @Output() sauvegarder = new EventEmitter<Filiere>();
  @Output() annuler     = new EventEmitter<void>();

  estModification = false;
  departementId = 0;
  erreur = '';

  form: Filiere = {
    id: 0,
    code: '',
    nom: '',
    departement: { id: 0, code: '', nom: '' },
  };

  ngOnInit(): void {
    if (this.filiere) {
      this.form = { ...this.filiere };
      this.departementId = this.filiere.departement.id;
      this.estModification = true;
    }
  }

  onDeptChange(): void {
    const dept = this.departements
      .find(d => d.id === +this.departementId);
    if (dept) this.form.departement = { ...dept };
  }

  // Auto-majuscule code
  onCodeInput(): void {
    this.form.code = this.form.code.toUpperCase();
  }

  valider(): boolean {
    this.erreur = '';
    if (!this.form.nom.trim()) {
      this.erreur = 'Le nom de la filière est obligatoire.';
      return false;
    }
    if (!this.form.code.trim()) {
      this.erreur = 'Le code est obligatoire.';
      return false;
    }
    if (!this.departementId || this.departementId === 0) {
      this.erreur = 'Veuillez sélectionner un département.';
      return false;
    }
    return true;
  }

  onSubmit(): void {
    if (!this.valider()) return;
    this.sauvegarder.emit({ ...this.form });
  }

  // Couleur du département sélectionné
  couleurDept(): string {
    const map: Record<string, string> = {
      GMG: '#dbeafe', GPM: '#d1fae5',
      GMR: '#fef3c7', ENR: '#fef9c3',
      GMM: '#ede9fe', EAM: '#fce7f3',
    };
    return map[this.form.departement?.code] ?? '#f3f4f6';
  }
}