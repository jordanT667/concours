export interface CursusDto {
  idCursus: string;
  libelle: string;
  annuler: boolean;
}

export interface NiveauDto {
  codeNiveau: string;
  libelleNiveau: string;
  codeCursus: string[];
}

export interface FiliereDto {
  codeFiliere: string;
  libelleFiliereFr: string;
  libelleFiliereEn: string;
  annuler: boolean;
  idCursus: string;
  codeNiveau: string;
  codeEcole: string;
}

export interface DiplomeDto {
  idDiplome: string;
  libelleFr: string;
  libelleEn: string;
  annuler: boolean;
  codeCursus: string[];
  codeNiveaux: string[];
}

export interface RegionDto {
  codeRegion: string;
  codePays: string;
  libelleRegionLangue1: string;
  libelleRegionLangue2?: string;
}

export interface DepartementDto {
  codeDepartementGeographique: string;
  codeRegion: string;
  libelleDepartementGeographiqueLangue1: string;
  libelleDepartementGeographiqueLangue2: string;
}

export interface LangueDto {
  code: string;
  libelleFr: string;
  libelleEn: string;
}

export interface EcoleDto {
  codeEcole: string;
  libelleFr?: string;
  libelleEn?: string;
  codeMat?: string;
  dateOuverture?: string;
  dateFermeture?: string;
  annuler: boolean;
}

export interface SerieDto {
  idSerie: string;
  libelleFr?: string;
  libelleEn?: string;
  annuler: boolean;
  codeDiplomes?: string[];
}

export interface BanqueDto {
  idBanque: string;
  libelleBanque?: string;
  annuler: boolean;
}

export interface SportDto {
  idSport: string;
  libelleFr?: string;
  libelleEn?: string;
  annuler: boolean;
}

export interface LoisirDto {
  idLoisir: string;
  libelleFr?: string;
  libelleEn?: string;
  annuler: boolean;
}

export interface HandicapDto {
  idHandicap: string;
  libelleFr?: string;
  libelleEn?: string;
  annuler: boolean;
}

export interface MentionDto {
  idMention: string;
  libelleFr?: string;
  libelleEn?: string;
}

export interface SiteDepotDto {
  idSiteDepot: string;
  libelle?: string;
  codeCursus?: string[];
}

export interface CentreExamenDto {
  idCexam: string;
  libeleFiliereFr: string;
  codeNiveaux?: string[];
}

export interface MatiereDto {
  idMatiere: string;
  libelle?: string;
}

export interface EpreuveMatiereDto {
  idMatiere: string;
  libelle?: string;
}
