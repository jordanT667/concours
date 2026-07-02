// Pièces du dossier physique exigées par l'ESTM

export interface Document {
  id: number;
  inscriptionId: number;
  type: TypeDocument;
  nom: string;
  url: string;
  estValide?: boolean;
}

export type TypeDocument =
  | 'RECU_EXPRESS_UNION'         // reçu de paiement
  | 'CNI'                        // carte nationale d'identité
  | 'ACTE_NAISSANCE'             // acte de naissance -3 mois
  | 'RELEVE_NOTES_PROBATOIRE'    // relevé de notes Probatoire/GCE OL
  | 'RELEVE_NOTES_BAC'           // relevé de notes Bac/GCE AL
  | 'COPIE_BAC'                  // photocopie certifiée Bac/GCE AL
  | 'PHOTO_IDENTITE'             // 4 photos 4x4
  | 'FICHE_INSCRIPTION';         // fiche générée après validation

// Statut de vérification du dossier (côté admin)
export interface DossierCandidature {
  inscriptionId: number;
  documents: Document[];
  estComplet: boolean;
  commentaireAdmin?: string;
}