import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PreinscriptionService } from '../../../core/services/preinscription.service';
import { AdminDataService } from '../../services/admin-data.service';
import { PreinscriptionDto } from '../../../core/models/preinscription.models';

@Component({
  selector: 'app-inscription-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inscription-detail.html',
  styleUrl: './inscription-detail.css'
})
export class InscriptionDetail implements OnInit {

  ins: PreinscriptionDto | null = null;
  chargement = true;
  erreur = '';
  private currentId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private preinscriptionService: PreinscriptionService,
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
      this.router.navigate(['/admin/inscriptions']);
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
        this.ins = found ?? null;
        if (!this.ins) this.erreur = 'Inscription introuvable.';
        this.chargement = false;
      },
      error: () => {
        this.erreur = 'Impossible de charger cette inscription.';
        this.chargement = false;
      }
    });
  }

  changerEtat(etat: string): void {
    if (!this.ins?.idPreins) return;
    this.preinscriptionService.updateEtat(this.ins.idPreins, etat).subscribe({
      next: () => {
        this.ins!.etatPreins = etat;
        this.adminData.invalidate();
      },
      error: () => { this.erreur = `Erreur lors du changement d'état.`; }
    });
  }

  retour(): void {
    this.router.navigate(['/admin/inscriptions']);
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
