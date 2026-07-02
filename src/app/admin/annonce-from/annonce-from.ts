import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Annonce, CouleurAnnonce, TypeAnnonce
} from '../../core/models/annonce.models';

@Component({
  selector: 'app-annonce-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./annonce-from.html',
  styleUrl: './annonce-from.css'
})
export class AnnonceForm implements OnInit {

  @Input() annonce: Annonce | null = null;
  @Input() ordreMax = 0;
  @Output() sauvegarder = new EventEmitter<Annonce>();
  @Output() annuler = new EventEmitter<void>();

  estModification = false;

  couleurs: { valeur: CouleurAnnonce; label: string; css: string }[] = [
    { valeur: 'gris',   label: 'Gris (info bancaire)',    css: 'bg-gris'   },
    { valeur: 'rouge',  label: 'Rouge (avertissement)',   css: 'bg-rouge'  },
    { valeur: 'orange', label: 'Orange (information)',    css: 'bg-orange' },
    { valeur: 'jaune',  label: 'Jaune (conseil)',         css: 'bg-jaune'  },
    { valeur: 'vert',   label: 'Vert (validation)',       css: 'bg-vert'   },
    { valeur: 'bleu',   label: 'Bleu (rappel)',           css: 'bg-bleu'   },
    { valeur: 'violet', label: 'Violet (contact)',        css: 'bg-violet' },
  ];

  types: { valeur: TypeAnnonce; label: string }[] = [
    { valeur: 'BANQUE',        label: ' Code bancaire'         },
    { valeur: 'AVERTISSEMENT', label: ' Avertissement'          },
    { valeur: 'INFORMATION',   label: ' Information'            },
    { valeur: 'CONSEIL',       label: ' Conseil'               },
    { valeur: 'VALIDATION',    label: 'Validation / Fiche'    },
    { valeur: 'RAPPEL',        label: ' procédure'      },
    { valeur: 'CONTACT',       label: 'Contact téléphone'     },
  ];

  form: Annonce = {
    id: 0,
    titre: '',
    contenu: '',
    couleur: 'bleu',
    type: 'INFORMATION',
    lien: '',
    libelleLien: '',
    actif: true,
    ordre: 1,
    dateCreation: new Date(),
  };

  ngOnInit(): void {
    if (this.annonce) {
      this.form = { ...this.annonce };
      this.estModification = true;
    } else {
      this.form.ordre = this.ordreMax + 1;
    }
  }

  cssApercu(): string {
    const map: Record<CouleurAnnonce, string> = {
      gris:   '#374151',
      rouge:  '#dc2626',
      orange: '#ea580c',
      jaune:  '#d97706',
      vert:   '#16a34a',
      bleu:   '#2563eb',
      violet: '#7c3aed',
    };
    return map[this.form.couleur];
  }

  onSubmit(): void {
    if (!this.form.contenu.trim()) return;
    this.sauvegarder.emit({ ...this.form });
  }
}