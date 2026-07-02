// À ajouter dans core/models/

export interface Annonce {
  id: number;
  titre: string;
  contenu: string;
  couleur: CouleurAnnonce;
  type: TypeAnnonce;
  lien?: string;           // lien optionnel (bouton vert)
  libelleLien?: string;    // texte du bouton lien
  actif: boolean;
  ordre: number;           // ordre d'affichage (1, 2, 3...)
  dateCreation: Date;
  dateExpiration?: Date;   // optionnel : expiration auto
}

export type CouleurAnnonce =
  | 'gris'      // Code CCA Banque (fond sombre)
  | 'rouge'     // Attention / avertissement
  | 'orange'    // Information importante
  | 'jaune'     // Conseil / astuce
  | 'vert'      // Validation / succès
  | 'bleu'      // Rappel / procédure
  | 'violet';   // Contact / informations

export type TypeAnnonce =
  | 'BANQUE'        // code bancaire
  | 'AVERTISSEMENT' // scanner reçu
  | 'INFORMATION'   // champs obligatoires
  | 'CONSEIL'       // nouveau candidat
  | 'VALIDATION'    // SMS reçu → fiche
  | 'RAPPEL'        // procédure
  | 'CONTACT';      // téléphone

// Pour créer/modifier
export interface CreateAnnonceDto {
  titre: string;
  contenu: string;
  couleur: CouleurAnnonce;
  type: TypeAnnonce;
  lien?: string;
  libelleLien?: string;
  actif: boolean;
  ordre: number;
  dateExpiration?: Date;
}