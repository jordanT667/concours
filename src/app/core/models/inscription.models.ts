import { Candidat } from './candidat.models';
import { FiliereDto as Filiere } from './filiere.models';
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


export interface UpdateStatutDto {
  statut: StatutInscription;
  motifRejet?: string;
}

export interface SoumettreInscriptionPayload {
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  paysNationalite: string;
  regionOrigine: string;
  departementOrigine: string;
  situationMatrimoniale: string;
  adresse: string;
  telephone: string;
  numeroCNI: string;
  email: string;
  premiereLangue: string;
  deuxiemeLangue: string;
  cursus: string;
  niveau: string;
  domaineFormation: string;
  diplomeAdmission: string;
  serieDiplome: string;
  mentionDiplome: string;
  anneeObtentionDip: number;
  etablissementObtention: string;
  paysObtention: string;
  anneeBEPC: number | null;
  choixEpreuve: string;
  centreConcours: string;
  centreDepotDossier: string;
  numeroRecuCCA: string;
  banque: string;
  imageRecuBase64: string;
  imageNom: string;
  parcoursScolaire: Array<{
    annee: number;
    etablissement: string;
    diplome: string;
    mention: string;
  }>;
  loisir1: string;
  loisir2: string;
  activite1: string;
  activite2: string;
  handicap: string;
  profession: string;
  nomPere: string;
  nomMere: string;
  telPere: string;
  emailPere: string;
  telMere: string;
}

export interface InscriptionResponseDto {
  numeroDossier: string;
  message?: string;
}