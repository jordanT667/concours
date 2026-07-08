import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Filiere, Departement } from '../../core/models/filiere.models';
import { FiliereFormComponent } from '../filiere-form/filiere-form';
import { FiliereService } from '../../core/services/filiere';

@Component({
  selector: 'app-filieres',
  standalone: true,
  imports: [CommonModule, FormsModule, FiliereFormComponent],
  templateUrl: './filieres.html',
  styleUrl: './filieres.css'
})
export class Filieres implements OnInit {

  filieres: Filiere[] = [];
  filieresFiltrees: Filiere[] = [];
  recherche = '';
  filtreDepartement = 'TOUS';
  formulaireOuvert = false;
  filiereSelectionnee: Filiere | null = null;
  isLoading = false;

  departements: Departement[] = [];

  constructor(private filiereService: FiliereService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.filiereService.getDepartements().subscribe({
      next: (deps) => this.departements = deps,
      error: () => {}
    });
    this.filiereService.getAll().subscribe({
      next: (data) => {
        this.filieres = data;
        this.filieresFiltrees = [...data];
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  appliquerFiltres(): void {
    this.filieresFiltrees = this.filieres.filter(f => {
      const matchRecherche = this.recherche === ''
        || f.nom.toLowerCase().includes(this.recherche.toLowerCase())
        || f.code.toLowerCase().includes(this.recherche.toLowerCase())
        || f.departement.nom.toLowerCase()
            .includes(this.recherche.toLowerCase());
      const matchDept = this.filtreDepartement === 'TOUS'
        || f.departement.code === this.filtreDepartement;
      return matchRecherche && matchDept;
    });
  }

  ouvrirFormulaire(f?: Filiere): void {
    this.filiereSelectionnee = f ?? null;
    this.formulaireOuvert = true;
  }

  fermerFormulaire(): void {
    this.formulaireOuvert = false;
    this.filiereSelectionnee = null;
  }

  sauvegarder(f: Filiere): void {
    const op$ = f.id
      ? this.filiereService.update(f.id, f)
      : this.filiereService.create(f);

    op$.subscribe({
      next: () => {
        this.ngOnInit();
        this.fermerFormulaire();
      },
      error: () => {}
    });
  }

  supprimer(id: number): void {
    if (!confirm('Supprimer cette filière ?')) return;
    this.filiereService.delete(id).subscribe({
      next: () => {
        this.filieres = this.filieres.filter(f => f.id !== id);
        this.appliquerFiltres();
      },
      error: () => {}
    });
  }

  // Nombre de filières par département
  nbParDept(code: string): number {
    return this.filieres
      .filter(f => f.departement.code === code).length;
  }

  // Couleur CSS par département
  couleurDept(code: string): string {
    const map: Record<string, string> = {
      GMG: 'dept-bleu',
      GPM: 'dept-vert',
      GMR: 'dept-orange',
      ENR: 'dept-jaune',
      GMM: 'dept-violet',
      EAM: 'dept-rose',
    };
    return map[code] ?? 'dept-gris';
  }

  // Filières du département actif (pour stats)
  get resumeParDept(): { dept: Departement; nb: number }[] {
    return this.departements.map(d => ({
      dept: d,
      nb: this.nbParDept(d.code)
    }));
  }
}