import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { timeout, retry, timer, forkJoin } from 'rxjs';
import { PreinscriptionService } from '../../../core/services/preinscription.service';
import { ReferenceCacheService } from '../../../core/services/reference-cache.service';
import { STORAGE_KEYS } from '../../../core/services/storage';
import { PreinscriptionDto } from '../../../core/models/preinscription.models';
import { ErrorResponse, ErrorCode } from '../../../core/models/error-response.models';
import { LoggerService } from '../../../core/services/logger.service';

type JsPDFType = InstanceType<typeof import('jspdf').default>;

interface Identification {
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  situationMatrimoniale: string;
  adresse: string;
  telephone: string;
  numeroCNI: string;
  email: string;
  premiereLangue: string;
  deuxiemeLangue: string;
  paysNationalite: string;
  regionOrigine: string;
  departementOrigine: string;
}

interface Specialisation {
  cursus: string;
  niveau: string;
  filiere: string;
  diplomeAdmission: string;
  serieDiplome: string;
  mentionDiplome: string;
  anneeObtentionDip: number;
  etablissementObtention: string;
  paysObtention: string;
  anneeBEPC: number;
  choixEpreuve: string;
  centreConcours: string;
  centreDepotDossier: string;
  numeroRecuCCA: string;
  banque: string;
  imageNom: string;
}

interface Diplome {
  annee: number;
  etablissement: string;
  diplome: string;
  mention: string;
}

interface Contacts {
  loisir1: string;
  loisir2: string;
  activite1: string;
  activite2: string;
  handicap: string;
  profession: string;
  descriptionActiviteProf: string;
  nomPere: string;
  telPere: string;
  nomMere: string;
  telMere: string;
  nomPersonneContact: string;
  telPersonneContact: string;
  emailPersonneContact: string;
}

interface Labels {
  cursus: string;
  niveau: string;
  filiere: string;
  diplome: string;
  mention: string;
  pays: string;
  paysObtention: string;
  region: string;
  departement: string;
  centreConcours: string;
  centreDepot: string;
  banque: string;
  langue1: string;
  langue2: string;
}

@Component({
  selector: 'app-step-finish',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './step-finish.html',
  styleUrl: './step-finish.css',
})
export class StepFinish implements OnInit {

  identification: Partial<Identification> = {};
  specialisation: Partial<Specialisation> = {};
  cursus: Diplome[] = [];
  contacts: Partial<Contacts> = {};
  labels: Partial<Labels> = {};

  numeroDossier = '';
  motDePasse = '';

  enregistrementReussi = false;
  enCours = false;
  erreur = '';
  attestation = false;
  copieFeedback = '';
  donneesIncompletes = false;
  pdfEnCours = false;
  ecoleChargee = false;

  private logoBase64: string | null = null;
  private logoCharge: Promise<void> = Promise.resolve();
  private soumissionEffectuee = false;
  private codeEcole = '';

  constructor(
    private router: Router,
    private preinscriptionService: PreinscriptionService,
    private refCache: ReferenceCacheService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.chargerDonnees();
    this.logoCharge = this.chargerLogo();
    this.verifierCompletude();
    this.chargerLabels();

    this.refCache.getEcoles().subscribe({
      next: (ecoles) => {
        const active = ecoles.find(e => !e.annuler);
        if (active) this.codeEcole = active.codeEcole;
        this.ecoleChargee = true;
      },
      error: () => { this.ecoleChargee = true; }
    });

    const existant = localStorage.getItem(STORAGE_KEYS.NUMERO_DOSSIER);
    if (existant) {
      this.numeroDossier = existant;
      this.enregistrementReussi = true;
      this.soumissionEffectuee = true;
    }
  }

  private chargerDonnees(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    this.identification = this.lireJSON<Identification>(STORAGE_KEYS.IDENTIFICATION) || {};
    this.specialisation = this.lireJSON<Specialisation>(STORAGE_KEYS.SPECIALISATION) || {};
    this.cursus = this.lireJSON<Diplome[]>(STORAGE_KEYS.CURSUS) || [];
    this.contacts = this.lireJSON<Contacts>(STORAGE_KEYS.CONTACTS) || {};
  }

  private chargerLabels(): void {
    forkJoin({
      cursus: this.refCache.getCursus(),
      niveaux: this.refCache.getNiveaux(),
      diplomes: this.refCache.getAllDiplomes(),
      mentions: this.refCache.getMentions(),
      pays: this.refCache.getPays(),
      centres: this.refCache.getCentresExamen(),
      sites: this.refCache.getSitesDepot(),
      banques: this.refCache.getBanques(),
      langues: this.refCache.getLangues()
    }).subscribe({
      next: (data) => {
        const sp = this.specialisation;
        const id = this.identification;

        const cursusObj = data.cursus.find(c => c.idCursus === sp.cursus);
        this.labels.cursus = cursusObj?.libelle ?? sp.cursus ?? '—';

        const niveauObj = data.niveaux.find(n => n.codeNiveau === sp.niveau);
        this.labels.niveau = niveauObj?.libelleNiveau ?? sp.niveau ?? '—';

        this.labels.filiere = sp.filiere ?? '—';

        const diplomeObj = data.diplomes.find(d => d.idDiplome === sp.diplomeAdmission);
        this.labels.diplome = diplomeObj?.libelleFr ?? sp.diplomeAdmission ?? '—';

        const mentionObj = data.mentions.find(m => m.idMention === sp.mentionDiplome);
        this.labels.mention = mentionObj?.libelleFr ?? sp.mentionDiplome ?? '—';

        const paysObj = data.pays.find(p => p.codePays === id.paysNationalite);
        this.labels.pays = paysObj?.libelleFr ?? id.paysNationalite ?? '—';

        const paysObtObj = data.pays.find(p => p.codePays === sp.paysObtention);
        this.labels.paysObtention = paysObtObj?.libelleFr ?? sp.paysObtention ?? '—';

        const centreObj = data.centres.find(c => c.idCexam === sp.centreConcours);
        this.labels.centreConcours = centreObj?.libeleFiliereFr ?? sp.centreConcours ?? '—';

        const siteObj = data.sites.find(s => s.idSiteDepot === sp.centreDepotDossier);
        this.labels.centreDepot = siteObj?.libelle ?? sp.centreDepotDossier ?? '—';

        const banqueObj = data.banques.find(b => b.idBanque === sp.banque);
        this.labels.banque = banqueObj?.libelleBanque ?? sp.banque ?? '—';

        const l1 = data.langues.find(l => l.code === id.premiereLangue);
        this.labels.langue1 = l1?.libelleFr ?? id.premiereLangue ?? '—';

        const l2 = data.langues.find(l => l.code === id.deuxiemeLangue);
        this.labels.langue2 = l2?.libelleFr ?? id.deuxiemeLangue ?? '—';
      },
      error: () => {}
    });
  }

  private lireJSON<T>(cle: string): T | null {
    try {
      const brut = localStorage.getItem(cle);
      return brut ? (JSON.parse(brut) as T) : null;
    } catch (e) {
      this.logger.error('Erreur lecture localStorage', cle, e);
      return null;
    }
  }

  private verifierCompletude(): void {
    const id = this.identification;
    const sp = this.specialisation;
    this.donneesIncompletes = !id?.nom || !id?.prenom || !id?.dateNaissance
      || !sp?.cursus || !sp?.niveau || !sp?.diplomeAdmission;
  }

  private chargerLogo(): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve();

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            this.logoBase64 = canvas.toDataURL('image/jpeg');
          }
        } catch (e) {
          this.logoBase64 = null;
        }
        resolve();
      };
      img.onerror = () => {
        this.logoBase64 = null;
        resolve();
      };
      img.src = 'enstmo.jfif';
    });
  }

  get diplomeRecent(): Diplome | null {
    return this.cursus && this.cursus.length > 0 ? this.cursus[0] : null;
  }

  get nomComplet(): string {
    const nom = this.identification?.nom || '';
    const prenom = this.identification?.prenom || '';
    return `${nom} ${prenom}`.trim();
  }

  get langues(): string {
    return [this.labels.langue1 || this.identification?.premiereLangue, this.labels.langue2 || this.identification?.deuxiemeLangue]
      .filter(Boolean)
      .join(' - ');
  }

  get sportsPratiques(): string {
    return [this.contacts?.activite1, this.contacts?.activite2]
      .filter(Boolean)
      .join(' - ');
  }

  get loisirs(): string {
    return [this.contacts?.loisir1, this.contacts?.loisir2]
      .filter(Boolean)
      .join(' - ');
  }

  onEnregistrer(): void {
    if (this.soumissionEffectuee || this.enCours) return;

    if (!this.codeEcole) {
      this.erreur = 'Chargement en cours, veuillez patienter quelques secondes puis réessayer.';
      return;
    }

    const validation = this.validerPayload();
    if (validation) {
      this.erreur = validation;
      return;
    }

    this.erreur = '';
    this.enCours = true;
    this.soumissionEffectuee = true;

    const payload = this.construirePayload();

    this.preinscriptionService.create(payload).pipe(
      retry({
        count: 1,
        delay: (err) => {
          const status = err?.status ?? 0;
          if (status >= 400 && status < 500) throw err;
          return timer(1500);
        }
      }),
      timeout(12000)
    ).subscribe({
      next: (res) => {
        this.numeroDossier = res.matricule ?? '';
        this.motDePasse = res.pwd ?? '';
        localStorage.setItem(STORAGE_KEYS.NUMERO_DOSSIER, this.numeroDossier);
        this.enregistrementReussi = true;
        this.enCours = false;
        setTimeout(async () => {
          try {
            await this.logoCharge;
            await this.genererPdf();
          } catch (e) {
            this.logger.error('PDF auto-gen failed', e);
          }
        }, 0);
      },
      error: (err: ErrorResponse | any) => {
        this.enCours = false;
        this.soumissionEffectuee = false;
        this.extraireErreur(err);
      },
    });
  }

  private validerPayload(): string | null {
    const id = this.identification;
    const sp = this.specialisation;
    if (!id?.nom || !id?.prenom) return 'Nom et prénom sont obligatoires.';
    if (!id?.dateNaissance) return 'Date de naissance obligatoire.';
    if (!id?.email) return 'Email obligatoire.';
    if (!id?.numeroCNI) return 'Numéro CNI obligatoire.';
    if (!sp?.cursus || !sp?.niveau) return 'Cursus et niveau obligatoires.';
    if (!sp?.diplomeAdmission) return "Diplôme d'admission obligatoire.";
    if (!sp?.numeroRecuCCA) return 'Numéro de reçu CCA obligatoire.';
    return null;
  }

  private construirePayload(): PreinscriptionDto {
    const annee = new Date().getFullYear();
    const cursusConcat = this.cursus.map(d => `${d.annee}|${d.etablissement}|${d.diplome}|${d.mention}`).join(';;');
    return {
      nom: this.identification.nom ?? '',
      prenom: this.identification.prenom ?? '',
      sexe: (this.identification.sexe ?? '').charAt(0).toUpperCase(),
      dateNaiss: this.identification.dateNaissance ?? '',
      lieuNaiss: this.identification.lieuNaissance ?? '',
      numCni: this.identification.numeroCNI ?? '',
      email: this.identification.email ?? '',
      numTel: this.identification.telephone ?? '',
      adresse: this.identification.adresse ?? '',
      paysNationalite: this.identification.paysNationalite ?? '',
      region: this.identification.regionOrigine ?? '',
      departementGeographique: this.identification.departementOrigine ?? '',
      situationMatrimoniale: this.identification.situationMatrimoniale ?? '',
      lang1: this.identification.premiereLangue ?? '',
      lang2: this.identification.deuxiemeLangue ?? '',
      cycles: this.specialisation.cursus ?? '',
      niveau: this.specialisation.niveau ?? '',
      choixFormation1: this.specialisation.filiere ?? '',
      diplomeAdmission: this.specialisation.diplomeAdmission ?? '',
      typeBacc: this.specialisation.serieDiplome ?? '',
      mention: this.specialisation.mentionDiplome ?? '',
      anneeObtentionDipl: this.specialisation.anneeObtentionDip ? String(this.specialisation.anneeObtentionDip) : '',
      etablissementDipl: this.specialisation.etablissementObtention ?? '',
      paysObtentionDipl: this.specialisation.paysObtention ?? '',
      centredexamen: this.specialisation.centreConcours ?? '',
      lieudepot: this.specialisation.centreDepotDossier ?? '',
      numRecu: this.specialisation.numeroRecuCCA ?? '',
      anneeDipAnt: this.specialisation.anneeBEPC ? String(this.specialisation.anneeBEPC) : '',
      loisir1: this.contacts.loisir1 || null,
      loisir2: this.contacts.loisir2 || null,
      sport1: this.contacts.activite1 ?? '',
      sport2: this.contacts.activite2 ?? '',
      activiteSportive: !!(this.contacts.activite1 || this.contacts.activite2),
      handicap: !!this.contacts.handicap && this.contacts.handicap !== 'Aucun',
      typeHandicap: this.contacts.handicap !== 'Aucun' ? (this.contacts.handicap ?? '') : '',
      activiteProfessionnelle: this.contacts.profession ?? '',
      descriptionActiviteProf: this.contacts.descriptionActiviteProf ?? '',
      nomParent1: this.contacts.nomPere ?? '',
      telParent1: this.contacts.telPere ?? '',
      nomParent2: this.contacts.nomMere ?? '',
      telParent2: this.contacts.telMere ?? '',
      nomPersonneAContacter: this.contacts.nomPersonneContact ?? '',
      telPersonneAContacter: this.contacts.telPersonneContact ?? '',
      emailPersonneAContacter: this.contacts.emailPersonneContact ?? '',
      anneeAcademique: `${annee}/${annee + 1}`,
      ecole: this.codeEcole,
      taf: cursusConcat ? true : undefined,
    };
  }

  private extraireErreur(err: any): void {
    if (err?.name === 'TimeoutError') {
      this.erreur = 'Le serveur met trop de temps à répondre. Veuillez réessayer.';
      return;
    }

    const body = err?.error || err;
    const code = body?.code;

    if (code === ErrorCode.DUPLICATE_RESOURCE) {
      this.erreur = 'Un dossier existe déjà avec cet email ou ce numéro CNI. Vérifiez vos informations ou contactez l\'administration.';
    } else if (code === ErrorCode.VALIDATION_FAILED) {
      const details = body?.details;
      this.erreur = details ? `Données invalides : ${details}` : 'Certains champs sont invalides. Vérifiez votre dossier.';
    } else if (err?.status === 0) {
      this.erreur = 'Serveur inaccessible. Vérifiez votre connexion internet et réessayez.';
    } else if (err?.status >= 500) {
      this.erreur = 'Erreur interne du serveur. Veuillez réessayer dans quelques instants.';
    } else {
      this.erreur = body?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
    }
  }

  async onRetelecharger(): Promise<void> {
    if (this.pdfEnCours) return;
    this.pdfEnCours = true;
    try {
      await this.logoCharge;
      await this.genererPdf();
    } finally {
      this.pdfEnCours = false;
    }
  }

  copier(texte: string): void {
    if (!navigator.clipboard) {
      this.copierFallback(texte);
      return;
    }
    navigator.clipboard.writeText(texte).then(
      () => this.afficherCopieFeedback(),
      () => this.copierFallback(texte)
    );
  }

  private copierFallback(texte: string): void {
    const el = document.createElement('textarea');
    el.value = texte;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.afficherCopieFeedback();
  }

  private afficherCopieFeedback(): void {
    this.copieFeedback = 'Copié !';
    setTimeout(() => { this.copieFeedback = ''; }, 2000);
  }

  onBack(): void {
    this.router.navigate(['/inscription/contacts']);
  }

  private async genererPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margeG = 15;
    const margeD = 195;
    const logoW = 32;
    const logoH = 32;
    const logoX = (210 - logoW) / 2;
    let y = 10;

    if (this.logoBase64) {
      try {
        doc.addImage(this.logoBase64, 'JPEG', logoX, y, logoW, logoH);
      } catch (e) {
        this.logger.warn("Impossible d'insérer le logo dans le PDF :", e);
      }
    }

    const yTexte = y + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('REPUBLIQUE DU CAMEROUN', margeG, yTexte);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Paix - Travail - Patrie', margeG, yTexte + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('REPUBLIC OF CAMEROON', margeD, yTexte, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Peace - Work - Fatherland', margeD, yTexte + 5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text("MINISTERE DE L'ENSEIGNEMENT SUPERIEUR", margeG, yTexte + 11);
    doc.text('MINISTRY OF HIGHER EDUCATION', margeD, yTexte + 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('ECOLE NATIONALE SUPERIEURE DES SCIENCES ET', margeG, yTexte + 16);
    doc.text('NATIONAL ADVANCED SCHOOL OF MARITIME', margeD, yTexte + 16, { align: 'right' });
    doc.text('TECHNIQUES MARITIMES ET OCEANIQUES (ENSTMO)', margeG, yTexte + 20);
    doc.text('AND OCEAN SCIENCE AND TECHNOLOGY', margeD, yTexte + 20, { align: 'right' });

    y = y + logoH + 4;
    doc.setDrawColor(20, 60, 130);
    doc.setLineWidth(0.5);
    doc.line(margeG, y, margeD, y);
    y += 2;

    y += 11;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 60, 130);
    doc.text('FICHE DE PREINSCRIPTION', 105, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(200, 60, 30);
    doc.text(`N° ${this.numeroDossier}`, 105, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    y += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text("REGISTRATION'S FILE", 105, y, { align: 'center' });

    y += 5;
    const annee = new Date().getFullYear();
    doc.setFont('helvetica', 'normal');
    doc.text(`Année académique ${annee}/${annee + 1}`, 105, y, { align: 'center' });

    y += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Cursus :', margeG, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(this.labels.cursus || this.specialisation?.cursus || '—'), margeG + 22, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Filière :', margeG + 75, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(this.labels.filiere || this.specialisation?.filiere || '—'), margeG + 120, y, { maxWidth: 60 });

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Niveau :', margeG, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(this.labels.niveau || this.specialisation?.niveau || '—'), margeG + 22, y);

    y += 8;
    y = this.tracerSectionTitre(doc, "IDENTIFICATION DU CANDIDAT / CANDIDAT'S IDENTIFICATION", margeG, y);

    y = this.ligneInfo(doc, margeG, y, 'Nom & Prénoms', this.nomComplet, 'Sexe', this.identification?.sexe);
    y = this.ligneInfo(doc, margeG, y, 'Né(e) le', this.identification?.dateNaissance, 'à', this.identification?.lieuNaissance);
    y = this.ligneInfo(doc, margeG, y, 'Pays de nationalité', this.labels.pays || this.identification?.paysNationalite, 'Région', this.identification?.regionOrigine);
    y = this.ligneInfo(doc, margeG, y, 'Département', this.identification?.departementOrigine, 'Situation', this.identification?.situationMatrimoniale);
    y = this.ligneInfo(doc, margeG, y, 'Adresse', this.identification?.adresse);
    y = this.ligneInfo(doc, margeG, y, 'N° de Téléphone', this.identification?.telephone, 'e-mail', this.identification?.email);
    y = this.ligneInfo(doc, margeG, y, 'N° CNI', this.identification?.numeroCNI);
    y = this.ligneInfo(doc, margeG, y, 'Langues officielles', this.langues || '—');

    y += 3;
    y = this.tracerSectionTitre(doc, 'PROFIL SCOLAIRE ET ACADEMIQUE / ACADEMIC PROFILE', margeG, y);

    y = this.ligneInfo(doc, margeG, y, "Diplôme d'admission", this.labels.diplome || this.specialisation?.diplomeAdmission, 'Série', this.specialisation?.serieDiplome);
    y = this.ligneInfo(doc, margeG, y, 'Mention', this.labels.mention || this.specialisation?.mentionDiplome, "Année d'obtention", this.specialisation?.anneeObtentionDip);
    y = this.ligneInfo(doc, margeG, y, "Établissement d'obtention", this.specialisation?.etablissementObtention);
    y = this.ligneInfo(doc, margeG, y, "Pays d'obtention", this.labels.paysObtention || this.specialisation?.paysObtention);
    y = this.ligneInfo(doc, margeG, y, 'Centre de concours', this.labels.centreConcours || this.specialisation?.centreConcours, 'Centre de dépôt', this.labels.centreDepot || this.specialisation?.centreDepotDossier);
    y = this.ligneInfo(doc, margeG, y, 'N° reçu CCA', this.specialisation?.numeroRecuCCA, 'Banque', this.labels.banque || this.specialisation?.banque);

    y += 3;
    y = this.tracerSectionTitre(doc, 'PARCOURS SCOLAIRE', margeG, y);

    if (this.cursus && this.cursus.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Année', margeG, y);
      doc.text('Établissement', margeG + 22, y);
      doc.text('Diplôme', margeG + 95, y);
      doc.text('Mention', margeG + 140, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      for (const d of this.cursus) {
        if (y > 270) { doc.addPage(); y = 18; }
        doc.text(String(d.annee ?? '—'), margeG, y);
        doc.text(String(d.etablissement ?? '—'), margeG + 22, y, { maxWidth: 70 });
        doc.text(String(d.diplome ?? '—'), margeG + 95, y, { maxWidth: 42 });
        doc.text(String(d.mention ?? '—'), margeG + 140, y);
        y += 5;
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Aucun diplôme renseigné.', margeG, y);
      y += 5;
    }

    y += 3;
    if (y > 250) { doc.addPage(); y = 18; }
    y = this.tracerSectionTitre(doc, 'INFORMATIONS COMPLEMENTAIRES / FURTHER INFORMATION', margeG, y);

    y = this.ligneInfo(doc, margeG, y, 'Handicap signalé', this.contacts?.handicap || 'Aucun', 'Profession', this.contacts?.profession);
    if (this.contacts?.descriptionActiviteProf) {
      y = this.ligneInfo(doc, margeG, y, 'Description activité', this.contacts.descriptionActiviteProf);
    }
    y = this.ligneInfo(doc, margeG, y, 'Sport', this.sportsPratiques || '—', 'Loisir', this.loisirs || '—');
    y = this.ligneInfo(doc, margeG, y, 'Nom du père', this.contacts?.nomPere, 'Tél. père', this.contacts?.telPere);
    y = this.ligneInfo(doc, margeG, y, 'Nom de la mère', this.contacts?.nomMere, 'Tél. mère', this.contacts?.telMere);
    y = this.ligneInfo(doc, margeG, y, 'Personne à contacter', this.contacts?.nomPersonneContact, 'Tél.', this.contacts?.telPersonneContact);
    if (this.contacts?.emailPersonneContact) {
      y = this.ligneInfo(doc, margeG, y, 'Email contact urgence', this.contacts.emailPersonneContact);
    }

    y += 6;
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 30, 20);
    doc.text('N.B :', margeG, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Le respect du rendez-vous de dépôt de dossier est obligatoire.', margeG + 10, y);

    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.text("Date et visa de l'étudiant", margeD, y, { align: 'right' });
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text('Date and student visa', margeD, y + 4, { align: 'right' });

    doc.save(`Fiche_Preinscription_ENSTMO_${this.numeroDossier}.pdf`);
  }

  private tracerSectionTitre(doc: JsPDFType, titre: string, x: number, y: number): number {
    doc.setFillColor(70, 70, 160);
    doc.rect(x, y - 4.5, 180, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(titre, x + 2, y);
    doc.setTextColor(0, 0, 0);
    return y + 8;
  }

  private ligneInfo(
    doc: JsPDFType, x: number, y: number,
    label1: string, valeur1: unknown,
    label2?: string, valeur2?: unknown
  ): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${label1} :`, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.versTexte(valeur1), x + 45, y, { maxWidth: label2 ? 55 : 130 });

    if (label2) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label2} :`, x + 105, y);
      doc.setFont('helvetica', 'normal');
      doc.text(this.versTexte(valeur2), x + 140, y, { maxWidth: 40 });
    }

    return y + 6;
  }

  private versTexte(valeur: unknown): string {
    if (valeur === undefined || valeur === null || valeur === '') {
      return '—';
    }
    return String(valeur);
  }
}
