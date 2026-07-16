import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentreExamenDto, NiveauDto } from '../../core/models/referentiel.models';
import { ConcoursReferenceService } from '../../core/services/concours-reference.service';

@Component({
  selector: 'app-centre-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centre-form.html',
  styleUrl: './centre-form.css'
})
export class CentreForm implements OnInit {

  @Input() centre: CentreExamenDto | null = null;
  @Output() sauvegarder = new EventEmitter<CentreExamenDto>();
  @Output() annuler = new EventEmitter<void>();

  niveauxDisponibles: NiveauDto[] = [];

  form: CentreExamenDto = {
    idCexam: '',
    libeleFiliereFr: '',
    codeNiveaux: [],
  };

  estModification = false;

  constructor(private ref: ConcoursReferenceService) {}

  ngOnInit(): void {
    this.ref.getNiveaux().subscribe({
      next: (data) => { this.niveauxDisponibles = data; },
      error: () => {}
    });
    if (this.centre) {
      this.form = { ...this.centre, codeNiveaux: [...(this.centre.codeNiveaux || [])] };
      this.estModification = true;
    }
  }

  toggleNiveau(codeNiveau: string): void {
    const niveaux = this.form.codeNiveaux || [];
    const index = niveaux.indexOf(codeNiveau);
    if (index >= 0) {
      niveaux.splice(index, 1);
    } else {
      niveaux.push(codeNiveau);
    }
    this.form.codeNiveaux = [...niveaux];
  }

  isNiveauSelected(codeNiveau: string): boolean {
    return (this.form.codeNiveaux || []).includes(codeNiveau);
  }

  onSubmit(): void {
    if (!this.form.idCexam || !this.form.libeleFiliereFr) return;
    this.sauvegarder.emit({ ...this.form });
  }
}