export interface ParametresSite {
  id: number;

  // ── Identité de l'école //
  nomEcole: string;          // "ESTM"
  nomComplet: string;        // "École Supérieure des Technologies et du Management"
  sigle: string;             // "ESTM-UBe"
  logoUrl: string;           // chemin vers le logo uploadé
  logoFile?: File;           // fichier logo (upload)
  couleurPrimaire: string;   // "#1aaa8a" (vert ESTM)
  couleurSecondaire: string; // "#1a2332" (bleu foncé)

  // ── Plateforme ─//
  nomPlateforme: string;     // "Concours ESTM 2026"
  sousTitre: string;         // "Plateforme d'inscription en ligne"
  anneeConcours: string;     // "2026/2027"
  urlPlateforme: string;     // "test.estm-ube.cm"

  // ── Footer ─//
  footerTexte: string;       // "© 2026 ESTM-UBe. Tous droits réservés."
  footerLien1Label: string;  // "Procédure d'inscription"
  footerLien1Url: string;    // "/procedure"
  footerLien2Label: string;  // "Résultats"
  footerLien2Url: string;    // "/resultats"
  footerTelephone: string;   // "695 73 41 50"
  footerEmail: string;       // "contact@estm-ube.cm"
  footerAdresse: string;     // "Bertoua, Région Est, Cameroun"

  // ── Concours ─//
  fraisInscription: number;  // 10000 (FCFA)
  nombrePlaces: number;      // 250
  dateOuverture: string;     // "2026-01-01"
  dateCloture: string;       // "2026-03-31"
  dateExamen: string;        // "2026-04-15"
  inscriptionOuverte: boolean;

  // ── SMS / Notifications ─//
  smsActif: boolean;
  smsExpediteur: string;     // "ESTM"
  emailNotification: string; // email admin pour alertes
}