// Aligné sur FiliereDto.java du backend
export interface FiliereDto {
  codeFiliere: string;
  libelleFiliereFr: string;
  libelleFiliereEn?: string;
  annuler?: boolean;
  idCursus?: string;
  codeNiveau?: string;
  codeEcole?: string;
}

// Conservé pour référence statique locale (pas envoyé à l'API)
export const FILIERES_ESTM = [
  'Éco-Matériaux',
  'Exploitation des Ressources Hydriques',
  'Exploitation et Traitement des Minerais',
  'Logistique Minière',
  'Maîtrise Énergétique',
  'Mécatronique',
  'Métallurgie et Sidérurgie',
  'Procédé de Production',
  'Production Énergétique',
  'Production Mécanique',
  'Sciences des Pierres et des Métaux Précieux',
  'Topographie',
];
