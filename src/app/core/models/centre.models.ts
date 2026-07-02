// Centres d'examen et de dépôt (11 villes du Cameroun)

export interface Centre {
  id: number;
  nom: string;
  ville: string;
  type: 'EXAMEN' | 'DEPOT' | 'EXAMEN_ET_DEPOT';
  adresse?: string;
  responsable?: string;
  telephone?: string;
}

// Centres réels selon la décision officielle
export const CENTRES_ESTM = [
  'Bafoussam',
  'Bamenda',
  'Batouri',
  'Bertoua',
  'Buea',
  'Douala',
  'Ebolowa',
  'Garoua',
  'Maroua',
  'Ngaoundéré',
  'Yaoundé',
];