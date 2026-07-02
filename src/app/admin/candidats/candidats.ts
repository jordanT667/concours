import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Candidat, StatutCandidat } from '../../core/models/candidat.models'

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidats.html',
  styleUrl: './candidats.css',
})
export class Candidats implements OnInit {

  candidats: Candidat[] = [];
  candidatsFiltres: Candidat[] = [];
  isLoading = false;
  recherche = '';
  filtreStatut = 'TOUS';

  statuts: StatutCandidat[] = [
    'EN_ATTENTE', 'VALIDE', 'REJETE', 'ADMIS', 'NON_ADMIS'
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.chargerCandidats();
  }

  chargerCandidats(): void {
    this.isLoading = true;
    // TODO: CandidatService.getCandidats()
    this.isLoading = false;
  }

  appliquerFiltres(): void {
    this.candidatsFiltres = this.candidats.filter(c => {
      const matchStatut = this.filtreStatut === 'TOUS'
        || c.statut === this.filtreStatut;
      const matchRecherche = this.recherche === ''
        || `${c.nom} ${c.prenom}`.toLowerCase()
          .includes(this.recherche.toLowerCase())
        || c.email.toLowerCase().includes(this.recherche.toLowerCase())
        || c.numeroCNI.includes(this.recherche);
      return matchStatut && matchRecherche;
    });
  }

  voirDetail(id: number): void {
    this.router.navigate(['/admin/candidats', id]);
  }

  couleurStatut(statut: StatutCandidat): string {
    const map: Record<StatutCandidat, string> = {
      'EN_ATTENTE': 'badge-orange',
      'VALIDE': 'badge-bleu',
      'REJETE': 'badge-rouge',
      'ADMIS': 'badge-vert',
      'NON_ADMIS': 'badge-gris'
    };
    return map[statut];
  }
}