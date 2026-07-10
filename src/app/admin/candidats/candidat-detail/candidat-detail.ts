import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatsService, CandidatDto } from '../../../core/services/candidats';

@Component({
  selector: 'app-candidat-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidat-detail.html',
  styleUrl: './candidat-detail.css'
})
export class CandidatDetail implements OnInit {

  candidat: CandidatDto | null = null;
  isLoading = true;
  erreur = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidatsService: CandidatsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/admin/candidats']);
      return;
    }
    this.charger(id);
  }

  charger(id: number): void {
    this.isLoading = true;
    this.erreur = '';
    this.candidatsService.getById(id).subscribe({
      next: (data) => {
        this.candidat = data;
        this.isLoading = false;
      },
      error: () => {
        this.erreur = 'Impossible de charger ce candidat.';
        this.isLoading = false;
      }
    });
  }

  retour(): void {
    this.router.navigate(['/admin/candidats']);
  }

  libelleStatut(statut: CandidatDto['statut']): string {
    const map: Record<CandidatDto['statut'], string> = {
      'EN_ATTENTE': 'En attente',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté',
      'ADMIS': 'Admis',
      'NON_ADMIS': 'Non admis'
    };
    return map[statut];
  }
}
