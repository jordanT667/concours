export interface PreinscriptionDto {
  idPreins?: number;

  // Identite
  nom: string;
  prenom: string;
  sexe: string;
  dateNaiss: string;
  lieuNaiss?: string;

  // Contact
  email?: string;
  numTel?: string;
  villeResid?: string;
  adresse?: string;

  // Nationalite / Localisation
  paysNationalite?: string;
  region?: string;
  departementGeographique?: string;

  // Langues
  lang1?: string;
  lang2?: string;

  // Formation
  typeFormation?: string;
  choixFormation1?: string;
  choixFormation2?: string;
  choixFormation3?: string;
  diplomeAdmission?: string;
  niveau?: string;
  cycles?: string;

  // Bac / Diplome
  typeBacc?: string;
  mention?: string;
  anneeObtentionDipl?: string;
  paysObtentionDipl?: string;
  etablissementDipl?: string;

  // Handicap & Loisirs
  handicap?: boolean;
  typeHandicap?: string;
  loisir1?: string;
  loisir2?: string;
  activiteSportive?: boolean;
  sport1?: string;
  sport2?: string;

  // Personnes a contacter
  nomPersonneAContacter?: string;
  telPersonneAContacter?: string;
  emailPersonneAContacter?: string;
  nomParent1?: string;
  telParent1?: string;
  nomParent2?: string;
  telParent2?: string;

  // Preinscription
  datePreins?: string;
  etatPreins?: string;
  matricule?: string;
  centredexamen?: string;
  anneeAcademique?: string;
  rentreeAcademique?: string;

  // Paiement
  paye?: boolean;
  datePaiement?: string;
  typePaiement?: string;
  rendezvousPaiement?: string;
  numRecu?: string;
  payeins?: boolean;

  // Dossier
  rendezvousDepotDossier?: string;
  lieudepot?: string;

  // Administration
  selectionner?: boolean;
  generer?: boolean;
  etapeAccorde?: string;
  annuler?: boolean;
  login?: string;
  pwd?: string;

  // Autres
  numCni: string;
  situationMatrimoniale?: string;
  ecole?: string;
  descriptionActiviteProf?: string;
  activiteProfessionnelle?: string;
  taf?: boolean;
  activiteSportiveCom?: boolean;
  anneeDipAnt?: string;
}
