import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParametresSite } from '../../core/models/parametres';

type Onglet =
  | 'identite'
  | 'plateforme'
  | 'footer'
  | 'concours'
  | 'notifications';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.html',
  styleUrl: './parametres.css'
})
export class ParametresComponent implements OnInit {

  ongletActif: Onglet = 'identite';
  logoPreview: string = '';
  isSaving = false;
  messageSauvegarde = '';

  onglets: { id: Onglet; label: string; icone: string }[] = [
    { id: 'identite',      label: 'Identité école',  icone: 'fa-solid fa-school'        },
    { id: 'plateforme',    label: 'Plateforme',       icone: 'fa-solid fa-globe'         },
    { id: 'footer',        label: 'Footer',           icone: 'fa-solid fa-layer-group'   },
    { id: 'concours',      label: 'Concours',         icone: 'fa-solid fa-trophy'        },
    { id: 'notifications', label: 'Notifications',    icone: 'fa-solid fa-bell'          },
  ];

  params: ParametresSite = {
    id: 1,
    // Identité
    nomEcole:          'ESTM',
    nomComplet:        'École Supérieure des Technologies et du Management',
    sigle:             'ESTM-UBe',
    logoUrl:           'assets/images/logo-estm.png',
    couleurPrimaire:   '#1aaa8a',
    couleurSecondaire: '#1a2332',
    // Plateforme
    nomPlateforme:     'Concours ESTM 2026',
    sousTitre:         'Plateforme d\'inscription en ligne',
    anneeConcours:     '2026/2027',
    urlPlateforme:     'test.estm-ube.cm',
    // Footer
    footerTexte:       '© 2026 ESTM-UBe. Tous droits réservés.',
    footerLien1Label:  'Procédure d\'inscription',
    footerLien1Url:    '/procedure',
    footerLien2Label:  'Résultats',
    footerLien2Url:    '/resultats',
    footerTelephone:   '695 73 41 50',
    footerEmail:       'contact@estm-ube.cm',
    footerAdresse:     'Bertoua, Région Est, Cameroun',
    // Concours
    fraisInscription:  10000,
    nombrePlaces:      250,
    dateOuverture:     '2026-01-01',
    dateCloture:       '2026-03-31',
    dateExamen:        '2026-04-15',
    inscriptionOuverte: true,
    // Notifications
    smsActif:          true,
    smsExpediteur:     'ESTM',
    emailNotification: 'admin@estm-ube.cm',
  };

  ngOnInit(): void {
    this.logoPreview = this.params.logoUrl;
    // TODO: ParametresService.getParametres()
    this.chargerDepuisLocalStorage();
  }

  chargerDepuisLocalStorage(): void {
    const saved = localStorage.getItem('parametres_site');
    if (saved) {
      this.params = { ...this.params, ...JSON.parse(saved) };
      this.logoPreview = this.params.logoUrl;
    }
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Vérification format
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      alert('Format accepté : PNG, JPG ou SVG');
      return;
    }

    // Vérification taille (max 2Mo)
    if (file.size > 2 * 1024 * 1024) {
      alert('Taille maximale : 2 Mo');
      return;
    }

    // Aperçu local
    const reader = new FileReader();
    reader.onload = (e) => {
      this.logoPreview = e.target?.result as string;
      this.params.logoUrl = this.logoPreview;
    };
    reader.readAsDataURL(file);
    this.params.logoFile = file;
  }

  sauvegarder(): void {
    this.isSaving = true;

    // Sauvegarder dans localStorage (puis TODO: service HTTP)
    const toSave = { ...this.params };
    delete toSave.logoFile;
    localStorage.setItem('parametres_site', JSON.stringify(toSave));

    // la couleur
    document.documentElement.style.setProperty(
      '--couleur-primaire', this.params.couleurPrimaire
    );
    document.documentElement.style.setProperty(
      '--couleur-secondaire', this.params.couleurSecondaire
    );

    setTimeout(() => {
      this.isSaving = false;
      this.messageSauvegarde = 'Paramètres sauvegardés avec succès !';
      setTimeout(() => this.messageSauvegarde = '', 3000);
    }, 800);

    // TODO: ParametresService.save(this.params)
  }

  reinitialiser(): void {
    if (!confirm('Réinitialiser tous les paramètres par défaut ?')) return;
    localStorage.removeItem('parametres_site');
    location.reload();
  }

  get joursAvantCloture(): number {
    const fin = new Date(this.params.dateCloture);
    const auj = new Date();
    const diff = fin.getTime() - auj.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}