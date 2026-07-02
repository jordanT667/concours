import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Inscription, StatutInscription } from '../../core/models/inscription.models';

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscriptions.html',
  styleUrl: './inscriptions.css'
})
export class Inscriptions implements OnInit {

  inscriptions: Inscription[] = [];
  inscriptionsFiltrees: Inscription[] = [];
  isLoading = false;

  // Filtres
  filtreStatut: string = 'TOUS';
  filtreCentre: string = 'TOUS';
  filtreFiliere: string = 'TOUS';
  recherche: string = '';

  // Centres réels ESTM
  centres = [
    'Bafoussam','Bamenda','Batouri','Bertoua',
    'Buea','Douala','Ebolowa','Garoua',
    'Maroua','Ngaoundéré','Yaoundé'
  ];

  // Statuts possibles
  statuts: StatutInscription[] = [
    'SOUMISE','EN_COURS_VERIFICATION','VALIDEE','REJETEE'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.chargerInscriptions();
  }

  chargerInscriptions(): void {
    this.isLoading = true;
    // TODO: remplacer par InscriptionService.getInscriptions()
    // this.inscriptionService.getInscriptions().subscribe(...)
    this.isLoading = false;
  }

  appliquerFiltres(): void {
    this.inscriptionsFiltrees = this.inscriptions.filter(ins => {
      const matchStatut = this.filtreStatut === 'TOUS'
        || ins.statut === this.filtreStatut;
      const matchCentre = this.filtreCentre === 'TOUS'
        || ins.centreExamen.ville === this.filtreCentre;
      const matchRecherche = this.recherche === ''
        || ins.candidat.nom.toLowerCase()
            .includes(this.recherche.toLowerCase())
        || ins.candidat.prenom.toLowerCase()
            .includes(this.recherche.toLowerCase())
        || ins.numeroRecu.includes(this.recherche);
      return matchStatut && matchCentre && matchRecherche;
    });
  }

  voirDetail(id: number): void {
    this.router.navigate(['/admin/inscriptions', id]);
  }

  valider(id: number, event: Event): void {
    event.stopPropagation();
    // TODO: InscriptionService.updateStatut(id, 'VALIDEE')
    console.log('Valider inscription', id);
  }

  rejeter(id: number, event: Event): void {
    event.stopPropagation();
    // TODO: InscriptionService.updateStatut(id, 'REJETEE')
    console.log('Rejeter inscription', id);
  }

  exporterCSV(): void {
    // TODO: export CSV de la liste filtrée
    console.log('Export CSV');
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

  libelleStatut(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      'SOUMISE': 'Soumise',
      'EN_COURS_VERIFICATION': 'En vérification',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée'
    };
    return map[statut];
  }
}