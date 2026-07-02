export interface Concours {
  id: number;
  anneeAcademique: string;       // "2026/2027"
  titre: string;                 // "Concours d'entrée ESTM 2026"
  nombrePlaces: number;          // 250
  dateOuverture: Date;           // ouverture des inscriptions
  dateCloture: Date;             
  dateExamen: Date;
  fraisInscription: number;      
  estOuvert: boolean;
  description?: string;
}       