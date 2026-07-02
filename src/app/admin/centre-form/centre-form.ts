import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Centre } from '../../core/models/centre.models'

@Component({
  selector: 'app-centre-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centre-form.html',
  styleUrl: './centre-form.css'
})
export class CentreForm implements OnInit {

  @Input() centre: Centre | null = null;
  @Output() sauvegarder = new EventEmitter<Centre>();
  @Output() annuler = new EventEmitter<void>();

  // Villes réelles ESTM
  villes = [
    'Bafoussam', 'Bamenda',  'Batouri',
    'Bertoua',   'Buea',     'Douala',
    'Ebolowa',   'Garoua',   'Maroua',
    'Ngaoundéré','Yaoundé',
  ];

  form: Centre = {
    id: 0,
    nom: '',
    ville: '',
    type: 'EXAMEN_ET_DEPOT',
    adresse: '',
    responsable: '',
    telephone: '',
  };

  estModification = false;

  ngOnInit(): void {
    if (this.centre) {
      this.form = { ...this.centre };
      this.estModification = true;
    }
  }

  // Auto-remplir le nom depuis la ville
  onVilleChange(): void {
    if (!this.estModification) {
      this.form.nom = `Centre de ${this.form.ville}`;
    }
  }

  onSubmit(): void {
    if (!this.form.ville || !this.form.nom) return;
    this.sauvegarder.emit({ ...this.form });
  }
}