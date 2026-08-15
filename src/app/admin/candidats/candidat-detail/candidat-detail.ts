import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDataService } from '../../services/admin-data.service';
import { PreinscriptionDto } from '../../../core/models/preinscription.models';

@Component({
  selector: 'app-candidat-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidat-detail.html',
  styleUrl: './candidat-detail.css'
})
export class CandidatDetail implements OnInit {

  candidat: PreinscriptionDto | null = null;
  chargement = true;
  erreur = '';
  private currentId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminData: AdminDataService
  ) {}

  get anneeAcademique(): string {
    const y = new Date().getFullYear();
    const m = new Date().getMonth();
    const start = m >= 7 ? y : y - 1;
    return `${start}/${start + 1}`;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/admin/candidats']);
      return;
    }
    this.currentId = id;
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.erreur = '';
    this.adminData.getById(this.currentId, this.anneeAcademique).subscribe({
      next: (found) => {
        this.candidat = found ?? null;
        if (!this.candidat) this.erreur = 'Candidat introuvable.';
        this.chargement = false;
      },
      error: () => {
        this.erreur = 'Impossible de charger ce candidat.';
        this.chargement = false;
      }
    });
  }

  retour(): void {
    this.router.navigate(['/admin/candidats']);
  }

  etatLibelle(etat?: string): string {
    switch (etat) {
      case 'E': return 'Soumis';
      case 'V': return 'Vérification';
      case 'S': return 'Sélectionné';
      case 'R': return 'Rejeté';
      default: return '—';
    }
  }

  etatCouleur(etat?: string): string {
    switch (etat) {
      case 'S': return 'badge-vert';
      case 'R': return 'badge-rouge';
      case 'V': return 'badge-bleu';
      default: return 'badge-orange';
    }
  }
}
