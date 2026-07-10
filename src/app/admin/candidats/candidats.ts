import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StatutCandidat } from '../../core/models/candidat.models';
import { CandidatsService, CandidatDto } from '../../core/services/candidats';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidats.html',
  styleUrl: './candidats.css',
})
export class Candidats implements OnInit {

  candidats: CandidatDto[] = [];
  candidatsFiltres: CandidatDto[] = [];
  isLoading = false;
  erreur = '';
  recherche = '';
  filtreStatut = 'TOUS';

  statuts: StatutCandidat[] = [
    'EN_ATTENTE', 'VALIDE', 'REJETE', 'ADMIS', 'NON_ADMIS'
  ];

  constructor(
    private router: Router,
    private candidatsService: CandidatsService
  ) {}

  ngOnInit(): void {
    this.chargerCandidats();
  }

  chargerCandidats(): void {
    this.isLoading = true;
    this.erreur = '';
    this.candidatsService.getAll().subscribe({
      next: (data) => {
        this.candidats = data;
        this.candidatsFiltres = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement candidats', err);
        this.erreur = 'Impossible de charger la liste des candidats.';
        this.isLoading = false;
      }
    });
  }

  appliquerFiltres(): void {
    this.candidatsFiltres = this.candidats.filter(c => {
      const matchStatut = this.filtreStatut === 'TOUS' || c.statut === this.filtreStatut;
      const matchRecherche = this.recherche === ''
        || `${c.nom} ${c.prenom}`.toLowerCase().includes(this.recherche.toLowerCase())
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
      'VALIDE':     'badge-bleu',
      'REJETE':     'badge-rouge',
      'ADMIS':      'badge-vert',
      'NON_ADMIS':  'badge-gris'
    };
    return map[statut];
  }
}
