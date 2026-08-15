import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ConcoursReferenceService } from './concours-reference.service';
import { PaysDto } from '../models/pays.models';
import {
  CursusDto, NiveauDto, DiplomeDto, FiliereDto,
  LangueDto, MentionDto, BanqueDto, CentreExamenDto,
  SiteDepotDto, SportDto, LoisirDto, HandicapDto, EcoleDto
} from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class ReferenceCacheService {

  private pays$?: Observable<PaysDto[]>;
  private langues$?: Observable<LangueDto[]>;
  private cursus$?: Observable<CursusDto[]>;
  private niveaux$?: Observable<NiveauDto[]>;
  private diplomes$?: Observable<DiplomeDto[]>;
  private mentions$?: Observable<MentionDto[]>;
  private banques$?: Observable<BanqueDto[]>;
  private centres$?: Observable<CentreExamenDto[]>;
  private sitesDepot$?: Observable<SiteDepotDto[]>;
  private sports$?: Observable<SportDto[]>;
  private loisirs$?: Observable<LoisirDto[]>;
  private handicaps$?: Observable<HandicapDto[]>;
  private ecoles$?: Observable<EcoleDto[]>;

  constructor(private ref: ConcoursReferenceService) {}

  getPays(): Observable<PaysDto[]> {
    if (!this.pays$) this.pays$ = this.ref.getPays().pipe(shareReplay(1));
    return this.pays$;
  }

  getLangues(): Observable<LangueDto[]> {
    if (!this.langues$) this.langues$ = this.ref.getLangues().pipe(shareReplay(1));
    return this.langues$;
  }

  getCursus(): Observable<CursusDto[]> {
    if (!this.cursus$) this.cursus$ = this.ref.getCursus().pipe(shareReplay(1));
    return this.cursus$;
  }

  getNiveaux(): Observable<NiveauDto[]> {
    if (!this.niveaux$) this.niveaux$ = this.ref.getNiveaux().pipe(shareReplay(1));
    return this.niveaux$;
  }

  getAllDiplomes(): Observable<DiplomeDto[]> {
    if (!this.diplomes$) this.diplomes$ = this.ref.getAllDiplomes().pipe(shareReplay(1));
    return this.diplomes$;
  }

  getMentions(): Observable<MentionDto[]> {
    if (!this.mentions$) this.mentions$ = this.ref.getMentions().pipe(shareReplay(1));
    return this.mentions$;
  }

  getBanques(): Observable<BanqueDto[]> {
    if (!this.banques$) this.banques$ = this.ref.getBanques().pipe(shareReplay(1));
    return this.banques$;
  }

  getCentresExamen(): Observable<CentreExamenDto[]> {
    if (!this.centres$) this.centres$ = this.ref.getCentresExamen().pipe(shareReplay(1));
    return this.centres$;
  }

  getSitesDepot(): Observable<SiteDepotDto[]> {
    if (!this.sitesDepot$) this.sitesDepot$ = this.ref.getSitesDepot().pipe(shareReplay(1));
    return this.sitesDepot$;
  }

  getSports(): Observable<SportDto[]> {
    if (!this.sports$) this.sports$ = this.ref.getSports().pipe(shareReplay(1));
    return this.sports$;
  }

  getLoisirs(): Observable<LoisirDto[]> {
    if (!this.loisirs$) this.loisirs$ = this.ref.getLoisirs().pipe(shareReplay(1));
    return this.loisirs$;
  }

  getHandicaps(): Observable<HandicapDto[]> {
    if (!this.handicaps$) this.handicaps$ = this.ref.getHandicaps().pipe(shareReplay(1));
    return this.handicaps$;
  }

  getEcoles(): Observable<EcoleDto[]> {
    if (!this.ecoles$) this.ecoles$ = this.ref.getEcoles().pipe(shareReplay(1));
    return this.ecoles$;
  }
}
