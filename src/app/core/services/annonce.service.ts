import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Annonce, CouleurAnnonce, TypeAnnonce } from '../models/annonce.models';

const STORAGE_KEY = 'estm_annonces';

const ANNONCES_DEFAUT: Annonce[] = [
  {
    id: 1, ordre: 1, actif: true, couleur: 'gris', type: 'BANQUE',
    titre: 'Code bancaire',
    contenu: 'Code complet CCA Banque: 10039-10012-00272769801-29',
    dateCreation: new Date(),
  },
  {
    id: 2, ordre: 2, actif: true, couleur: 'rouge', type: 'AVERTISSEMENT',
    titre: 'Format du reçu',
    contenu: "Scanner le reçu au format png ou jpg et le renommer avec le numéro du reçu. (Ne pas utiliser d'accents et de caractères spéciaux dans le nom du fichier)",
    dateCreation: new Date(),
  },
  {
    id: 3, ordre: 3, actif: true, couleur: 'orange', type: 'INFORMATION',
    titre: 'Champs obligatoires',
    contenu: 'Uniquement les champs suivis de * sont obligatoires',
    dateCreation: new Date(),
  },
  {
    id: 4, ordre: 4, actif: true, couleur: 'jaune', type: 'CONSEIL',
    titre: 'Nouveau candidat',
    contenu: 'Vous êtes nouveau ? Cliquez sur le bouton NEXT en-dessous de cette page pour remplir le formulaire.',
    dateCreation: new Date(),
  },
  {
    id: 5, ordre: 5, actif: true, couleur: 'vert', type: 'VALIDATION',
    titre: 'Télécharger fiche',
    contenu: "Si vous avez reçu le SMS de validation de votre inscription, suivez ce lien pour télécharger votre fiche d'inscription.",
    lien: 'https://concours.enstmo-ueb.cm/downf.php',
    libelleLien: "Télécharger sa fiche d'inscription",
    dateCreation: new Date(),
  },
  {
    id: 6, ordre: 6, actif: true, couleur: 'bleu', type: 'RAPPEL',
    titre: "Procédure d'inscription",
    contenu: "Rappel : Pour toute préoccupation, revoir la procédure d'inscription en ligne sur le lien suivant",
    lien: 'https://concours.enstmo-ueb.cm/downf.php',
    libelleLien: "Lien rappel procédure d'inscription",
    dateCreation: new Date(),
  },
  {
    id: 7, ordre: 7, actif: true, couleur: 'violet', type: 'CONTACT',
    titre: 'Contact',
    contenu: "Pour toutes informations complémentaires concernant l'inscription, 695 73 41 50",
    lien: 'tel:+237695734150',
    libelleLien: 'Appeler le 695 73 41 50',
    dateCreation: new Date(),
  },
];

@Injectable({ providedIn: 'root' })
export class AnnonceService {

  private _annonces$ = new BehaviorSubject<Annonce[]>(this.charger());

  readonly annonces$ = this._annonces$.asObservable();

  get annonces(): Annonce[] {
    return this._annonces$.getValue();
  }

  get annoncesActives(): Annonce[] {
    return this.annonces
      .filter(a => a.actif)
      .sort((a, b) => a.ordre - b.ordre);
  }

  sauvegarder(annonce: Annonce): void {
    const liste = [...this.annonces];
    const index = liste.findIndex(a => a.id === annonce.id);
    if (index !== -1) {
      liste[index] = annonce;
    } else {
      annonce.id = Date.now();
      annonce.dateCreation = new Date();
      liste.push(annonce);
    }
    this.persister(liste.sort((a, b) => a.ordre - b.ordre));
  }

  toggleActif(id: number): void {
    const liste = this.annonces.map(a =>
      a.id === id ? { ...a, actif: !a.actif } : a
    );
    this.persister(liste);
  }

  monterOrdre(id: number): void {
    const liste = [...this.annonces].sort((a, b) => a.ordre - b.ordre);
    const idx = liste.findIndex(a => a.id === id);
    if (idx <= 0) return;
    [liste[idx].ordre, liste[idx - 1].ordre] = [liste[idx - 1].ordre, liste[idx].ordre];
    this.persister(liste.sort((a, b) => a.ordre - b.ordre));
  }

  descendreOrdre(id: number): void {
    const liste = [...this.annonces].sort((a, b) => a.ordre - b.ordre);
    const idx = liste.findIndex(a => a.id === id);
    if (idx < 0 || idx >= liste.length - 1) return;
    [liste[idx].ordre, liste[idx + 1].ordre] = [liste[idx + 1].ordre, liste[idx].ordre];
    this.persister(liste.sort((a, b) => a.ordre - b.ordre));
  }

  supprimer(id: number): void {
    this.persister(this.annonces.filter(a => a.id !== id));
  }

  private charger(): Annonce[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { }
    return [...ANNONCES_DEFAUT];
  }

  private persister(liste: Annonce[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
    this._annonces$.next(liste);
  }

  cssClass(couleur: string): string {
    const map: Record<string, string> = {
      gris: 'annonce-gris', rouge: 'annonce-rouge',
      orange: 'annonce-orange', jaune: 'annonce-jaune',
      vert: 'annonce-vert', bleu: 'annonce-bleu', violet: 'annonce-violet',
    };
    return map[couleur] ?? '';
  }
}
