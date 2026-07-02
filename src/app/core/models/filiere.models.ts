// Les filières réelles de l'ESTM récupérées sur le site

export interface Filiere {
  id: number;
  code: string;
  nom: string;
  departement: Departement;
}

export interface Departement {
  id: number;
  code: string;
  nom: string;
}

// Filières réelles de l'ESTM (pour référence)
export const FILIERES_ESTM = [
  // Sciences et Technologies
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

// Départements réels de l'ESTM
export const DEPARTEMENTS_ESTM = [
  { code: 'GMG', nom: 'Génie Minier et Géologique' },
  { code: 'GPM', nom: 'Procédés Minéralurgiques' },
  { code: 'GMR', nom: 'Matériaux et Valorisation des Ressources' },
  { code: 'EAM', nom: 'Économie et Administration' },
  { code: 'ENR', nom: 'Énergies Renouvelables' },
  { code: 'GMM', nom: 'Mécanique et Mécatronique' },
];