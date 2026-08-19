// Enveloppe standard des réponses du backend Spring Boot

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp?: string;
}

// Stats pour les cartes du dashboard admin
export interface DashboardStats {
  totalInscrits: number;
  totalValides: number;
  totalEnAttente: number;
  totalRejetes: number;
  tauxValidation: number;   // en %
  parCentre: StatParCentre[];
  parFiliere: StatParFiliere[];
}

export interface StatParCentre {
  centre: string;
  nombre: number;
}

export interface StatParFiliere {
  filiere: string;
  nombre: number;
}