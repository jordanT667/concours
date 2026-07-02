import { Candidat } from './candidat.models';
import { Filiere } from './filiere.models';
import { Centre } from './centre.models';

export interface Inscription {
  id: number;
  candidat: Candidat;
  filiere: Filiere;
  centreExamen: Centre;
  centreDepot: Centre;
  numeroRecu: string;           
  imageRecu: string;            
  dateInscription: Date;
  statut: StatutInscription;
  ficheInscriptionUrl?: string; 
  smsSent?: boolean;            
}

export type StatutInscription =
  | 'SOUMISE'
  | 'EN_COURS_VERIFICATION'
  | 'VALIDEE'
  | 'REJETEE';


export interface CreateInscriptionDto {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  sexe: 'M' | 'F';
  numeroCNI: string;
  filiereId: number;
  centreExamenId: number;
  centreDepotId: number;
  numeroRecu: string;
  imageRecu: File;
}

export interface UpdateStatutDto {
  statut: StatutInscription;
  motifRejet?: string;
}