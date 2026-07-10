import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { STORAGE_KEYS } from '../../core/services/storage';

interface WizardStep {
  label: string;
  route: string;
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './wizard.html',
  styleUrl: './wizard.css'
})
export class WizardComponent implements OnInit, OnDestroy {

  steps: WizardStep[] = [
    { label: 'RECOMMANDATION',        route: 'recommandation' },
    { label: 'IDENTIFICATION',        route: 'identification' },
    { label: 'SPÉCIALISATION',        route: 'specialisation' },
    { label: 'CURSUS ACADÉMIQUE',     route: 'cursus' },
    { label: 'AUTRES INFOS & CONTACTS', route: 'contacts' },
    { label: 'FINISH',                route: 'finish' },
  ];

  currentStep = 0;

  private routerSub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Synchroniser l'onglet actif à chaque changement de route
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      const segment = e.urlAfterRedirects.split('/').pop() ?? '';
      const idx = this.steps.findIndex(s => s.route === segment);
      if (idx !== -1) {
        this.currentStep = idx;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, String(idx));
        }
      }
    });

    // Restaurer l'étape depuis le localStorage au premier chargement
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
      if (saved !== null) {
        this.currentStep = parseInt(saved, 10);
      }
    }
    this.navigateToStep(this.currentStep);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  // Permet de revenir à une étape déjà complétée
  goToStep(index: number): void {
    if (index <= this.currentStep) {
      this.navigateToStep(index);
    }
  }

  private navigateToStep(index: number): void {
    this.router.navigate(['/inscription', this.steps[index].route]);
  }
}
