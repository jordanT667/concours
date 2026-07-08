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
