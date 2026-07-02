// Ce composant est utilisé dans le wizard public
// Il affiche les annonces visibles aux candidats

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Annonce } from '../../../core/models/annonce.models';

@Component({
  selector: 'app-annonces-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './annonces-banner.html',
  styleUrl: './annonces-banner.css'
})
export class AnnoncesBannerComponent implements OnInit {

  annonces: Annonce[] = [];

  ngOnInit(): void {
    // TODO: AnnonceService.getAnnoncesActives()
    // Pour l'instant données statiques
  }

  cssAnnonce(couleur: string): string {
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
}