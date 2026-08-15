import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, of, forkJoin, catchError } from 'rxjs';
import { CursusAdminService } from '../../core/services/cursus-admin.service';
import { NiveauAdminService } from '../../core/services/niveau-admin.service';
import { FiliereService } from '../../core/services/filiere';
import { CursusDto, NiveauDto } from '../../core/models/referentiel.models';
import { FiliereDto } from '../../core/models/filiere.models';
import { ErrorResponse } from '../../core/models/error-response.models';

interface LigneRecap {
  id: number;
  cursusCode: string;
  cursusLibelle: string;
  niveauCode: string;
  niveauLibelle: string;
  filiereCode: string;
  filiereFr: string;
  filiereEn: string;
}

const STORAGE_KEY = 'enstmo_gcursus_combinaisons';

@Component({
  selector: 'app-g-cursus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './g-cursus.html',
  styleUrl: './g-cursus.css'
})
export class GCursus implements OnInit {

  allCursus: CursusDto[] = [];
  allNiveaux: NiveauDto[] = [];
  allFilieres: FiliereDto[] = [];

  formCursus = { code: '', libelle: '' };
  formNiveau = { code: '', libelle: '' };
  formFiliere = { code: '', libelleFr: '', libelleEn: '' };

  lignes: LigneRecap[] = [];
  compteur = 0;

  recherche = '';
  lignesFiltrees: LigneRecap[] = [];

  isLoading = false;
  enSoumission = false;
  erreur = '';
  succes = '';

  editIndex: number | null = null;

  constructor(
    private cursusSvc: CursusAdminService,
    private niveauSvc: NiveauAdminService,
    private filiereSvc: FiliereService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.isLoading = true;
    forkJoin({
      cursus: this.cursusSvc.getAll(),
      niveaux: this.niveauSvc.getAll(),
      filieres: this.filiereSvc.getAll().pipe(catchError(() => of([] as FiliereDto[])))
    }).subscribe({
      next: ({ cursus, niveaux, filieres }) => {
        this.allCursus = cursus.filter(c => !c.annuler);
        this.allNiveaux = niveaux;
        this.allFilieres = filieres.filter(f => !f.annuler);
        this.construireLignes();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.erreur = 'Impossible de charger les données.';
      }
    });
  }

  private construireLignes(): void {
    this.lignes = [];
    this.compteur = 0;

    // Source de vérité : les combinaisons sauvegardées localement
    const saved = this.getSavedCombinaisons();

    // Fusionner : combinaisons sauvées + filières backend non-encore dans saved
    const dejaVues = new Set<string>();

    for (const s of saved) {
      dejaVues.add(`${s.cursusCode}|${s.niveauCode}|${s.filiereCode}`);
      this.lignes.push({ ...s, id: ++this.compteur });
    }

    // Ajouter les filières backend pas encore dans saved
    for (const filiere of this.allFilieres) {
      const cle = `${filiere.idCursus}|${filiere.codeNiveau}|${filiere.codeFiliere}`;
      if (dejaVues.has(cle)) continue;
      const cursus = this.allCursus.find(c => c.idCursus === filiere.idCursus);
      const niveau = this.allNiveaux.find(n => n.codeNiveau === filiere.codeNiveau);
      this.lignes.push({
        id: ++this.compteur,
        cursusCode: filiere.idCursus ?? '',
        cursusLibelle: cursus?.libelle ?? filiere.idCursus ?? '',
        niveauCode: filiere.codeNiveau ?? '',
        niveauLibelle: niveau?.libelleNiveau ?? filiere.codeNiveau ?? '',
        filiereCode: filiere.codeFiliere,
        filiereFr: filiere.libelleFiliereFr,
        filiereEn: filiere.libelleFiliereEn ?? ''
      });
    }

    this.appliquerFiltre();
  }

  appliquerFiltre(): void {
    const q = this.recherche.toLowerCase().trim();
    if (!q) {
      this.lignesFiltrees = [...this.lignes];
      return;
    }
    this.lignesFiltrees = this.lignes.filter(l =>
      l.cursusCode.toLowerCase().includes(q) ||
      l.cursusLibelle.toLowerCase().includes(q) ||
      l.niveauCode.toLowerCase().includes(q) ||
      l.niveauLibelle.toLowerCase().includes(q) ||
      l.filiereCode.toLowerCase().includes(q) ||
      l.filiereFr.toLowerCase().includes(q)
    );
  }

  ajouter(): void {
    const codeCursus = this.formCursus.code.trim().toUpperCase();
    const libCursus = this.formCursus.libelle.trim();
    const codeNiveau = this.formNiveau.code.trim().toUpperCase();
    const libNiveau = this.formNiveau.libelle.trim();
    const codeFiliere = this.formFiliere.code.trim().toUpperCase();
    const libFr = this.formFiliere.libelleFr.trim();
    const libEn = this.formFiliere.libelleEn.trim();

    if (!codeCursus || !libCursus) {
      this.erreur = 'Le code et le libellé du cursus sont obligatoires.';
      return;
    }
    if (!codeNiveau || !libNiveau) {
      this.erreur = 'Le code et le libellé du niveau sont obligatoires.';
      return;
    }
    if (codeNiveau.length > 2) {
      this.erreur = 'Le code niveau doit faire 2 caractères max (ex: L1, M2).';
      return;
    }
    if (codeCursus.length > 5) {
      this.erreur = 'Le code cursus doit faire 5 caractères max (ex: ING).';
      return;
    }

    this.erreur = '';
    this.enSoumission = true;

    const cursusExiste = this.allCursus.find(c => c.idCursus === codeCursus);

    // Etape 1 : créer cursus si inexistant
    const cursus$ = cursusExiste
      ? of(cursusExiste)
      : this.cursusSvc.create({ idCursus: codeCursus, libelle: libCursus, annuler: false }).pipe(
          catchError((err: ErrorResponse | any) => {
            if ((err as ErrorResponse)?.code === 'ERR_006') return of(null);
            throw err;
          })
        );

    cursus$.pipe(
      // Etape 2 : créer niveau si inexistant
      switchMap(() => {
        const niveauExiste = this.allNiveaux.find(n => n.codeNiveau === codeNiveau);
        if (niveauExiste) return of(niveauExiste);
        return this.niveauSvc.create({
          codeNiveau: codeNiveau,
          libelleNiveau: libNiveau,
          codeCursus: [codeCursus]
        }).pipe(
          catchError((err: ErrorResponse | any) => {
            if ((err as ErrorResponse)?.code === 'ERR_006') return of(null);
            throw err;
          })
        );
      }),
      // Etape 3 : tenter l'association niveau-cursus (ignore l'erreur si échoue)
      switchMap(() => {
        return this.niveauSvc.updateCursus(codeNiveau, [codeCursus]).pipe(
          catchError(() => of(null))
        );
      }),
      // Etape 4 : créer filière si renseignée
      switchMap(() => {
        if (!codeFiliere || !libFr) return of(null);
        const filiereDto: FiliereDto = {
          codeFiliere,
          libelleFiliereFr: libFr,
          libelleFiliereEn: libEn || '',
          annuler: false,
          idCursus: codeCursus,
          codeNiveau: codeNiveau
        };
        const filiereExiste = this.allFilieres.find(f => f.codeFiliere === codeFiliere);
        return filiereExiste
          ? this.filiereSvc.update(codeFiliere, filiereDto)
          : this.filiereSvc.create(filiereDto).pipe(
              catchError((err: ErrorResponse | any) => {
                if ((err as ErrorResponse)?.code === 'ERR_006') return of(null);
                throw err;
              })
            );
      })
    ).subscribe({
      next: () => {
        this.enSoumission = false;

        const nouvelleLigne: LigneRecap = {
          id: 0,
          cursusCode: codeCursus,
          cursusLibelle: libCursus,
          niveauCode: codeNiveau,
          niveauLibelle: libNiveau,
          filiereCode: codeFiliere,
          filiereFr: libFr,
          filiereEn: libEn
        };

        if (this.editIndex !== null) {
          const oldLigne = this.lignesFiltrees[this.editIndex];
          const idx = this.lignes.findIndex(l => l.id === oldLigne.id);
          if (idx !== -1) this.lignes[idx] = { ...nouvelleLigne, id: oldLigne.id };
          this.succes = 'Combinaison modifiée avec succès.';
          this.editIndex = null;
        } else {
          nouvelleLigne.id = ++this.compteur;
          this.lignes.push(nouvelleLigne);
          this.succes = 'Combinaison créée avec succès.';
        }

        this.sauvegarderCombinaisons();
        this.appliquerFiltre();
        this.resetForm();
        this.rafraichirDonneesBackend();
        setTimeout(() => this.succes = '', 4000);
      },
      error: (err: ErrorResponse | any) => {
        this.enSoumission = false;
        const msg = (err as ErrorResponse)?.message;
        if (msg) {
          this.erreur = msg;
        } else if (err?.status === 0) {
          this.erreur = 'Serveur inaccessible.';
        } else {
          this.erreur = 'Erreur lors de l\'enregistrement.';
        }
      }
    });
  }

  private rafraichirDonneesBackend(): void {
    forkJoin({
      cursus: this.cursusSvc.getAll(),
      niveaux: this.niveauSvc.getAll(),
      filieres: this.filiereSvc.getAll().pipe(catchError(() => of([] as FiliereDto[])))
    }).subscribe(({ cursus, niveaux, filieres }) => {
      this.allCursus = cursus.filter(c => !c.annuler);
      this.allNiveaux = niveaux;
      this.allFilieres = filieres.filter(f => !f.annuler);
    });
  }

  editer(index: number): void {
    const l = this.lignesFiltrees[index];
    this.formCursus = { code: l.cursusCode, libelle: l.cursusLibelle };
    this.formNiveau = { code: l.niveauCode, libelle: l.niveauLibelle };
    this.formFiliere = { code: l.filiereCode, libelleFr: l.filiereFr, libelleEn: l.filiereEn };
    this.editIndex = index;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  supprimer(index: number): void {
    const ligne = this.lignesFiltrees[index];

    const supprimerLocalement = () => {
      this.lignes = this.lignes.filter(l => l.id !== ligne.id);
      this.sauvegarderCombinaisons();
      this.appliquerFiltre();
      this.succes = 'Combinaison supprimée.';
      setTimeout(() => this.succes = '', 3000);
    };

    if (ligne.filiereCode) {
      this.filiereSvc.delete(ligne.filiereCode).pipe(
        catchError(() => of(null))
      ).subscribe(() => supprimerLocalement());
    } else if (ligne.cursusCode && !ligne.niveauCode) {
      this.cursusSvc.delete(ligne.cursusCode).pipe(
        catchError(() => of(null))
      ).subscribe(() => supprimerLocalement());
    } else if (ligne.niveauCode && !ligne.cursusCode) {
      this.niveauSvc.delete(ligne.niveauCode).pipe(
        catchError(() => of(null))
      ).subscribe(() => supprimerLocalement());
    } else {
      supprimerLocalement();
    }

    if (this.editIndex === index) {
      this.editIndex = null;
      this.resetForm();
    }
  }

  onCursusSelect(): void {
    const found = this.allCursus.find(c => c.idCursus === this.formCursus.code);
    this.formCursus.libelle = found?.libelle ?? '';
    this.formNiveau = { code: '', libelle: '' };
    this.formFiliere = { code: '', libelleFr: '', libelleEn: '' };
  }

  onNiveauSelect(): void {
    const found = this.allNiveaux.find(n => n.codeNiveau === this.formNiveau.code);
    this.formNiveau.libelle = found?.libelleNiveau ?? '';
    this.formFiliere = { code: '', libelleFr: '', libelleEn: '' };
  }

  annulerEdition(): void {
    this.editIndex = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formCursus = { code: '', libelle: '' };
    this.formNiveau = { code: '', libelle: '' };
    this.formFiliere = { code: '', libelleFr: '', libelleEn: '' };
  }

  private getSavedCombinaisons(): LigneRecap[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private sauvegarderCombinaisons(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lignes));
  }
}
