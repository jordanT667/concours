import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inscription, StatutInscription }
  from '../../core/models/inscription.models';

@Component({
  selector: 'app-inscriptions-recentes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inscriptions-recentes.html',
  styleUrl: './inscriptions-recentes.css'
})
export class InscriptionsRecentes {

  @Input() inscriptions: Inscription[] = [];
  @Output() voirTout = new EventEmitter<void>();

  couleurStatut(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      'SOUMISE': 'badge-orange',
      'EN_COURS_VERIFICATION': 'badge-bleu',
      'VALIDEE': 'badge-vert',
      'REJETEE': 'badge-rouge',
    };
    return map[statut];
  }

  libelleStatut(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      'SOUMISE': 'Soumise',
      'EN_COURS_VERIFICATION': 'En vérification',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée',
    };
    return map[statut];
  }
}