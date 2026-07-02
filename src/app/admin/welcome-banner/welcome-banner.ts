import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-banner.html',
  styleUrl: './welcome-banner.css'
})
export class WelcomeBanner implements OnInit {

  @Input() prenom = '';
  @Input() nom = '';
  @Input() totalInscrits = 0;

  salutation = '';
  dateAujourdhui = '';

  ngOnInit(): void {
    this.salutation = this.calculerSalutation();
    this.dateAujourdhui = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  calculerSalutation(): string {
    const heure = new Date().getHours();
    if (heure < 12) return 'Bonjour';
    if (heure < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}