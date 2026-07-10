import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InscriptionService } from '../../../core/services/inscription';
import { Inscription, StatutInscription } from '../../../core/models/inscription.models';

@Component({
  selector: 'app-inscription-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inscription-detail.html',
  styleUrl: './inscription-detail.css'
})
export class InscriptionDetail implements OnInit {

  inscription: Inscription | null = null;
  isLoading = true;
  erreur = '';
  private currentId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inscriptionService: InscriptionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/admin/inscriptions']);
      return;
    }
    this.currentId = id;
    this.charger(id);
  }

  reessayer(): void {
    this.charger(this.currentId);
  }

  charger(id: number): void {
    this.isLoading = true;
    this.erreur = '';
    this.inscriptionService.getById(id).subscribe({
      next: (data) => {
        this.inscription = data;
        this.isLoading = false;
      },
      error: () => {
        this.erreur = 'Impossible de charger cette inscription.';
        this.isLoading = false;
      }
    });
  }

  valider(): void {
    if (!this.inscription) return;
    this.inscriptionService.updateStatut(this.inscription.id, { statut: 'VALIDEE' }).subscribe({
      next: (updated) => { this.inscription = updated; },
      error: () => { this.erreur = 'Erreur lors de la validation.'; }
    });
  }

  rejeter(): void {
    if (!this.inscription) return;
    this.inscriptionService.updateStatut(this.inscription.id, { statut: 'REJETEE' }).subscribe({
      next: (updated) => { this.inscription = updated; },
      error: () => { this.erreur = 'Erreur lors du rejet.'; }
    });
  }

  retour(): void {
    this.router.navigate(['/admin/inscriptions']);
  }

  libelleStatut(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      'SOUMISE': 'Soumise',
      'EN_COURS_VERIFICATION': 'En vérification',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée'
    };
    return map[statut];
  }

  couleurStatut(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      'SOUMISE': 'badge-orange',
      'EN_COURS_VERIFICATION': 'badge-bleu',
      'VALIDEE': 'badge-vert',
      'REJETEE': 'badge-rouge'
    };
    return map[statut];
  }
}
