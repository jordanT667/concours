import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Inscription, StatutInscription } from '../../core/models/inscription.models';
import { FormsModule, NgForm } from '@angular/forms';


@Component({
  selector: 'app-inscriptions-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscriptions-detail.html',
  styleUrl: './inscriptions-detail.css',
})
export class InscriptionDetail implements OnInit {

  inscription: Inscription | null = null;
  isLoading = false;
  motifRejet = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.chargerDetail(+id);
  }

  chargerDetail(id: number): void {
    this.isLoading = true;
    // TODO: InscriptionService.getInscriptionById(id)
    this.isLoading = false;
  }

  valider(): void {
    // TODO: InscriptionService.updateStatut(id, 'VALIDEE')
    console.log('Valider');
  }

  rejeter(): void {
    if (!this.motifRejet.trim()) {
      alert('Veuillez saisir un motif de rejet');
      return;
    }
    // TODO: InscriptionService.updateStatut(id, 'REJETEE', motif)
    console.log('Rejeter avec motif:', this.motifRejet);
  }

  telechargerFiche(): void {
    // TODO: ouvrir ficheInscriptionUrl
    window.open(this.inscription?.ficheInscriptionUrl, '_blank');
  }

  retour(): void {
    this.router.navigate(['/admin/inscriptions']);
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