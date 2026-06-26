import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

interface WizardStep {
  label: string;
  route: string;
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgFor, NgIf],
  templateUrl: './wizard.html',
  styleUrl: './wizard.css'
})
export class WizardComponent implements OnInit {

  steps: WizardStep[] = [
    { label: 'RECOMMANDATION', route: 'recommandation' },
    { label: 'IDENTIFICATION', route: 'identification' },
    { label: 'SPÉCIALISATION', route: 'specialisation' },
    { label: 'CURSUS ACADÉMIQUE', route: 'cursus' },
    { label: 'AUTRES INFOS & CONTACTS', route: 'contacts' },
    { label: 'FINISH', route: 'finish' },
  ];

  currentStep = 0;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('enstmo_current_step');
      if (saved !== null) {
        this.currentStep = parseInt(saved, 10);
      }
    }
    this.navigateToStep(this.currentStep);
  }

  goToStep(index: number): void {
    if (index <= this.currentStep) {
      this.currentStep = index;
      this.navigateToStep(index);
    }
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('enstmo_current_step', String(this.currentStep));
      }
      this.navigateToStep(this.currentStep);
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('enstmo_current_step', String(this.currentStep));
      }
      this.navigateToStep(this.currentStep);
    }
  }

  // NOTE : la méthode finish() a été retirée. L'enregistrement final,
  // la validation et la génération du PDF sont désormais entièrement
  // gérés par le composant StepFinish (bouton "Enregistrer ma préinscription").

  private navigateToStep(index: number): void {
    const route = this.steps[index].route;
    this.router.navigate(['/inscription', route]);
  }
}