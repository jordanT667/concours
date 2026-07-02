import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Centre } from '../../core/models/centre.models';
import { CentreService } from '../../core/services/centre.service';
import { CentreForm } from '../centre-form/centre-form';

@Component({
  selector: 'app-centres',
  standalone: true,
  imports: [CommonModule, FormsModule, CentreForm],
  templateUrl: './centres.html',
  styleUrl: './centres.css'
})
export class Centres implements OnInit {

  centres: Centre[] = [];
  centresFiltres: Centre[] = [];
  recherche = '';
  filtreType = 'TOUS';
  isLoading = false;
  formulaireOuvert = false;
  centreSelectionne: Centre | null = null;

  constructor(private centreService: CentreService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.isLoading = true;
    this.centreService.getAll().subscribe({
      next: data => {
        this.centres = data;
        this.appliquerFiltres();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  appliquerFiltres(): void {
    this.centresFiltres = this.centres.filter(c => {
      const matchRecherche = this.recherche === ''
        || c.ville.toLowerCase().includes(this.recherche.toLowerCase())
        || c.nom.toLowerCase().includes(this.recherche.toLowerCase());
      const matchType = this.filtreType === 'TOUS' || c.type === this.filtreType;
      return matchRecherche && matchType;
    });
  }

  ouvrirFormulaire(centre?: Centre): void {
    this.centreSelectionne = centre ?? null;
    this.formulaireOuvert = true;
  }

  fermerFormulaire(): void {
    this.formulaireOuvert = false;
    this.centreSelectionne = null;
  }

  sauvegarder(centre: Centre): void {
    const op$ = centre.id
      ? this.centreService.update(centre.id, centre)
      : this.centreService.create(centre);

    op$.subscribe({
      next: () => {
        this.fermerFormulaire();
        this.charger();
      }
    });
  }

  supprimer(id: number): void {
    if (!confirm('Confirmer la suppression de ce centre ?')) return;
    this.centreService.delete(id).subscribe({
      next: () => this.charger()
    });
  }

  libelleType(type: string): string {
    const map: Record<string, string> = {
      'EXAMEN':          'Examen uniquement',
      'DEPOT':           'Dépôt uniquement',
      'EXAMEN_ET_DEPOT': 'Examen & Dépôt',
    };
    return map[type] ?? type;
  }

  couleurType(type: string): string {
    const map: Record<string, string> = {
      'EXAMEN':          'badge-bleu',
      'DEPOT':           'badge-orange',
      'EXAMEN_ET_DEPOT': 'badge-vert',
    };
    return map[type] ?? '';
  }

  regionDeVille(ville: string): string {
    const map: Record<string, string> = {
      'Bafoussam':  'Région Ouest',
      'Bamenda':    'Région Nord-Ouest',
      'Batouri':    'Région Est',
      'Bertoua':    'Région Est',
      'Buea':       'Région Sud-Ouest',
      'Douala':     'Région Littoral',
      'Ebolowa':    'Région Sud',
      'Garoua':     'Région Nord',
      'Maroua':     'Région Extrême-Nord',
      'Ngaoundéré': 'Région Adamaoua',
      'Yaoundé':    'Région Centre',
    };
    return map[ville] ?? '';
  }
}
