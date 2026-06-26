import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step-recommandation',
  standalone: true,
  imports: [],
  templateUrl: './step-recommandation.html',
  styleUrl: './step-recommandation.css'
})
export class StepRecommandation {

  constructor(private router: Router) { }

  onTelechargerFiche(): void {

    console.log('Télécharger fiche d\'inscription');
    window.open('https://concours.enstmo-ueb.cm/downf.php', '_blank');
  }

  onVoirProcedure(): void {

    console.log('Voir procédure d\'inscription');
    window.open('https://concours.enstmo-ueb.cm/downf.php', '_blank');
  }
}