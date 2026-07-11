// Le candidat qui s'inscrit au concours

export interface Candidat {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: Date;
  lieuNaissance: string;
  nationalite: string;
  sexe: 'M' | 'F';
  numeroCNI: string;
  numeroInscription?: string;    
  statut: StatutCandidat;
}

export type StatutCandidat =
  | 'EN_ATTENTE'      
  | 'VALIDE'          
  | 'REJETE'          
  | 'ADMIS'           
  | 'NON_ADMIS';