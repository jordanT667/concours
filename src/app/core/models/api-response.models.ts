// Enveloppe standard des réponses du backend Spring Boot

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp?: string;
}

// Réponse paginée pour les listes (dashboard admin)
export interface PageResponse<T> {
  content: T[];
  totalElements: number;    // total inscriptions
  totalPages: number;
  currentPage: number;
  pageSize: number;
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