import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import jsPDF from 'jspdf';

// ── Formes des données telles qu'enregistrées par chaque step précédent ──
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
  domaineFormation: string;
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
  imageRecu: string;
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
  nomPere: string;
  nomMere: string;
  telPere: string;
  emailPere: string;
  telMere: string;
}

@Component({
  selector: 'app-step-finish',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './step-finish.html',
  styleUrl: './step-finish.css',
})
export class StepFinish implements OnInit {

  // ── Données regroupées depuis le localStorage ────────────────────────
  identification: Partial<Identification> = {};
  specialisation: Partial<Specialisation> = {};
  cursus: Diplome[] = [];
  contacts: Partial<Contacts> = {};

  // ── Numéro de dossier (généré une seule fois par session) ────────────
  numeroDossier = '';
  compteur = 1;
  genererNumeroDossier() {
    let compteur =
      Number(localStorage.getItem('compteurDossier')) || 1;
    this.numeroDossier = compteur.toString().padStart(6, '0')
    compteur = compteur + 1;
    localStorage.setItem('compteurDossier', compteur.toString());

  }

  // ── États d'affichage ─────────────────────────────────────────────────
  enregistrementReussi = false;
  enCours = false;
  erreur = '';

  // ── Logo de l'école, chargé en base64 pour être intégré au PDF ───────
  //    Le fichier doit exister dans src/assets/logo-enstmo.png
  //    Si absent, le PDF est généré quand même, simplement sans logo.
  private logoBase64: string | null = null;
  private readonly logoUrl = 'src/assets/enstmo.png';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.chargerDonnees();
    this.genererOuRecupererNumeroDossier();
    this.chargerLogo();
  }

  // ── Lecture de toutes les étapes précédentes ──────────────────────────
  private chargerDonnees(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    this.identification = this.lireJSON<Identification>('enstmo_identification') || {};
    this.specialisation = this.lireJSON<Specialisation>('enstmo_specialisation') || {};
    this.cursus = this.lireJSON<Diplome[]>('enstmo_cursus') || [];
    this.contacts = this.lireJSON<Contacts>('enstmo_contacts') || {};
  }

  private lireJSON<T>(cle: string): T | null {
    try {
      const brut = localStorage.getItem(cle);
      return brut ? (JSON.parse(brut) as T) : null;
    } catch (e) {
      console.error('Erreur lecture localStorage', cle, e);
      return null;
    }
  }

  // ── Numéro de dossier séquentiel : récupéré si déjà généré pour cette session,
  //    sinon on incrémente le compteur global et on assigne le suivant.
  private genererOuRecupererNumeroDossier(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.numeroDossier = this.incrementerCompteur();
      return;
    }
    // Si un numéro existe déjà pour cette session d'inscription, on le réutilise
    const existant = localStorage.getItem('enstmo_numero_dossier');
    if (existant) {
      this.numeroDossier = existant;
    } else {
      // Nouveau dossier : on incrémente le compteur global
      this.numeroDossier = this.incrementerCompteur();
      localStorage.setItem('enstmo_numero_dossier', this.numeroDossier);
    }
  }

  /**
   * Lit le compteur global dans localStorage (clé `enstmo_compteur_dossiers`),
   * l'incrémente, le sauvegarde, puis retourne le numéro formaté.
   * Format : AAAA-NNNNNN  (ex: 2026-000001, 2026-000002, …)
   */
  private incrementerCompteur(): string {
    const annee = new Date().getFullYear();
    const CLE_COMPTEUR = 'enstmo_compteur_dossiers';
    const valActuelle = localStorage.getItem(CLE_COMPTEUR);
    const compteur = valActuelle ? parseInt(valActuelle, 10) + 1 : 1;
    localStorage.setItem(CLE_COMPTEUR, String(compteur));
    // Numéro séquentiel sur 6 chiffres : 000001, 000002, ...
    const suffixe = String(compteur).padStart(6, '0');
    return `${annee}-${suffixe}`;
  }

  // ── Chargement défensif du logo en base64 (ne bloque jamais le PDF) ──
  private chargerLogo(): void {
    if (typeof window === 'undefined') {
      return;
    }
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
          this.logoBase64 = canvas.toDataURL('image/png');
        }
      } catch (e) {
        console.warn('Logo non utilisable pour le PDF (CORS ou format) :', e);
        this.logoBase64 = null;
      }
    };
    img.onerror = () => {
      console.warn(`Logo introuvable à l'emplacement ${this.logoUrl} — le PDF sera généré sans logo.`);
      this.logoBase64 = null;
    };
    img.src = this.logoUrl;
  }

  // ── Diplôme le plus récent (le tableau est trié décroissant par step-cursus) ─
  get diplomeRecent(): Diplome | null {
    return this.cursus && this.cursus.length > 0 ? this.cursus[0] : null;
  }

  get nomComplet(): string {
    const nom = this.identification?.nom || '';
    const prenom = this.identification?.prenom || '';
    return `${nom} ${prenom}`.trim();
  }

  get langues(): string {
    return [this.identification?.premiereLangue, this.identification?.deuxiemeLangue]
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

  // ── Action principale : générer le PDF et marquer l'enregistrement comme fait ─
  onEnregistrer(): void {
    this.erreur = '';
    this.enCours = true;

    // Petit délai pour laisser l'UI afficher l'état "en cours" avant le
    // traitement synchrone (potentiellement un peu long) de jsPDF.
    setTimeout(() => {
      try {
        this.genererPdf();
        this.enregistrementReussi = true;
      } catch (e) {
        console.error('Erreur génération PDF', e);
        this.erreur = 'Une erreur est survenue lors de la génération de votre fiche. Veuillez réessayer.';
      } finally {
        this.enCours = false;
      }
    }, 150);
  }

  // ── Permet de re-télécharger le PDF après succès sans tout refaire ───
  onRetelecharger(): void {
    this.genererPdf();
  }

  onBack(): void {
    this.router.navigate(['/inscription/contacts']);
  }

  // ── Génération du PDF avec jsPDF, mise en page fidèle au modèle papier ─
  private genererPdf(): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margeG = 15;
    const margeD = 195;
    let y = 16;

    // ── En-tête avec logo centré (si disponible) ────────────────────────
    if (this.logoBase64) {
      try {
        doc.addImage(this.logoBase64, 'PNG', 95, y - 4, 20, 20);
      } catch (e) {
        console.warn("Impossible d'insérer le logo dans le PDF :", e);
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('REPUBLIQUE DU CAMEROUN', margeG, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Paix - Travail - Patrie', margeG, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('REPUBLIC OF CAMEROON', margeD, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Peace - Work - Fatherland', margeD, y + 4, { align: 'right' });

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text("MINISTERE DE L'ENSEIGNEMENT SUPERIEUR", margeG, y);
    doc.text('MINISTRY OF HIGHER EDUCATION', margeD, y, { align: 'right' });

    y += 5;
    doc.text('ECOLE NATIONALE SUPERIEURE DES SCIENCES ET', margeG, y);
    doc.text('NATIONAL ADVANCED SCHOOL OF MARITIME', margeD, y, { align: 'right' });
    y += 4;
    doc.text('TECHNIQUES MARITIMES ET OCEANIQUES (ENSTMO)', margeG, y);
    doc.text('AND OCEAN SCIENCE AND TECHNOLOGY', margeD, y, { align: 'right' });

    // ── Titre / numéro de dossier ────────────────────────────────────────
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
    doc.setFont('helvetica', 'normal');
    doc.text(`Année académique ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`, 105, y, { align: 'center' });

    // ── Type / Formation ─────────────────────────────────────────────────
    y += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Cursus :', margeG, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(this.specialisation?.cursus || '—'), margeG + 22, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Domaine de formation :', margeG + 75, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(this.specialisation?.domaineFormation || '—'), margeG + 120, y, { maxWidth: 60 });

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Niveau :', margeG, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(this.specialisation?.niveau || '—'), margeG + 22, y);

    // ── Identification du candidat ───────────────────────────────────────
    y += 8;
    y = this.tracerSectionTitre(doc, "IDENTIFICATION DU CANDIDAT / CANDIDAT'S IDENTIFICATION", margeG, y);

    y = this.ligneInfo(doc, margeG, y, 'Nom & Prénoms', this.nomComplet, 'Sexe', this.identification?.sexe);
    y = this.ligneInfo(doc, margeG, y, 'Né(e) le', this.identification?.dateNaissance, 'à', this.identification?.lieuNaissance);
    y = this.ligneInfo(doc, margeG, y, 'Pays de nationalité', this.identification?.paysNationalite, 'Région', this.identification?.regionOrigine);
    y = this.ligneInfo(doc, margeG, y, 'Département', this.identification?.departementOrigine, 'Situation', this.identification?.situationMatrimoniale);
    y = this.ligneInfo(doc, margeG, y, 'Adresse', this.identification?.adresse);
    y = this.ligneInfo(doc, margeG, y, 'N° de Téléphone', this.identification?.telephone, 'e-mail', this.identification?.email);
    y = this.ligneInfo(doc, margeG, y, 'N° CNI', this.identification?.numeroCNI);
    y = this.ligneInfo(doc, margeG, y, 'Langues officielles', this.langues || '—');

    // ── Profil scolaire et académique ────────────────────────────────────
    y += 3;
    y = this.tracerSectionTitre(doc, 'PROFIL SCOLAIRE ET ACADEMIQUE / ACADEMIC PROFILE', margeG, y);

    y = this.ligneInfo(doc, margeG, y, "Diplôme d'admission", this.specialisation?.diplomeAdmission, 'Série', this.specialisation?.serieDiplome);
    y = this.ligneInfo(doc, margeG, y, 'Mention', this.specialisation?.mentionDiplome, "Année d'obtention", this.specialisation?.anneeObtentionDip);
    y = this.ligneInfo(doc, margeG, y, "Établissement d'obtention", this.specialisation?.etablissementObtention);
    y = this.ligneInfo(doc, margeG, y, "Pays d'obtention", this.specialisation?.paysObtention);
    y = this.ligneInfo(doc, margeG, y, 'Centre de concours', this.specialisation?.centreConcours, 'Centre de dépôt', this.specialisation?.centreDepotDossier);
    y = this.ligneInfo(doc, margeG, y, 'N° reçu CCA', this.specialisation?.numeroRecuCCA, 'Banque', this.specialisation?.banque);

    // ── Parcours scolaire (tableau des diplômes) ─────────────────────────
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

    // ── Informations complémentaires ─────────────────────────────────────
    y += 3;
    if (y > 250) { doc.addPage(); y = 18; }
    y = this.tracerSectionTitre(doc, 'INFORMATIONS COMPLEMENTAIRES / FURTHER INFORMATION', margeG, y);

    y = this.ligneInfo(doc, margeG, y, 'Handicap signalé', this.contacts?.handicap, 'Profession', this.contacts?.profession);
    y = this.ligneInfo(doc, margeG, y, 'Sport', this.sportsPratiques || '—');
    y = this.ligneInfo(doc, margeG, y, 'Loisir', this.loisirs || '—');
    y = this.ligneInfo(doc, margeG, y, 'Nom du père', this.contacts?.nomPere, 'Tél. père', this.contacts?.telPere);
    y = this.ligneInfo(doc, margeG, y, 'Nom de la mère', this.contacts?.nomMere, 'Tél. mère', this.contacts?.telMere);
    if (this.contacts?.emailPere) {
      y = this.ligneInfo(doc, margeG, y, 'E-mail du père', this.contacts?.emailPere);
    }

    // ── Pied de page ──────────────────────────────────────────────────────
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

  // ── Bandeau de titre de section (fond bleu/violet, texte blanc) ──────
  private tracerSectionTitre(doc: jsPDF, titre: string, x: number, y: number): number {
    doc.setFillColor(70, 70, 160);
    doc.rect(x, y - 4.5, 180, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(titre, x + 2, y);
    doc.setTextColor(0, 0, 0);
    return y + 8;
  }

  // ── Affiche "Label : valeur" et, optionnellement, un 2e couple sur la même ligne ─
  private ligneInfo(
    doc: jsPDF, x: number, y: number,
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

  // ── Normalise une valeur potentiellement vide/undefined/null en texte ─
  private versTexte(valeur: unknown): string {
    if (valeur === undefined || valeur === null || valeur === '') {
      return '—';
    }
    return String(valeur);
  }
}