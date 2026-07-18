import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnnonceService } from '../../../core/services/annonce.service';
import { Annonce } from '../../../core/models/annonce.models';

@Component({
  selector: 'app-step-recommandation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-reccommandation.html',
  styleUrl: './step-reccommandation.css'
})
export class StepRecommandation implements OnInit {

  annonces: Annonce[] = [];

  constructor(private annonceService: AnnonceService, private router: Router) {}

  ngOnInit(): void {
    this.annonceService.annonces$.subscribe(liste => {
      this.annonces = liste
        .filter(a => a.actif)
        .sort((a, b) => a.ordre - b.ordre);
    });
  }

  couleurCss(couleur: string): string {
    const map: Record<string, string> = {
      gris:   '#374151',
      rouge:  '#dc2626',
      orange: '#ea580c',
      jaune:  '#d97706',
      vert:   '#16a34a',
      bleu:   '#2563eb',
      violet: '#7c3aed',
    };
    return map[couleur] ?? '#374151';
  }

  ouvrirLien(lien: string): void {
    window.open(lien, '_blank', 'noopener,noreferrer');
  }

  onNext(): void {
    this.router.navigate(['/inscription/identification']);
  }
}
