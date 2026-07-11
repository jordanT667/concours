import { Routes } from '@angular/router';
import { WizardComponent } from './pages/wizard/wizard';

import { StepRecommandation } from './pages/wizard/step-reccommandation/step-reccommandation';
import { StepIdentification } from './pages/wizard/step-identification/step-identification';
import { StepSpecialisation } from './pages/wizard/step-specialisation/step-specialisation';
import { StepCursus } from './pages/wizard/step-cursus/step-cursus';
import { StepContacts } from './pages/wizard/step-contacts/step-contacts';
import { StepFinish } from './pages/wizard/step-finish/step-finish';
import { Login } from './auth/login/login';
import { authGuard, adminOnlyGuard } from './core/guards/guard-guard';
import { Layout } from './layout/layout';
import {
  wizardIdentificationGuard,
  wizardSpecialisationGuard,
  wizardCursusGuard,
  wizardContactsGuard,
  wizardFinishGuard,
} from './core/guards/wizard-step.guard';


export const routes: Routes = [

  {
    path: 'inscription',
    component: WizardComponent,
    children: [
      { path: 'recommandation', component: StepRecommandation },
      { path: 'identification', component: StepIdentification,  canActivate: [wizardIdentificationGuard] },
      { path: 'specialisation', component: StepSpecialisation,  canActivate: [wizardSpecialisationGuard] },
      { path: 'cursus',         component: StepCursus,          canActivate: [wizardCursusGuard] },
      { path: 'contacts',       component: StepContacts,        canActivate: [wizardContactsGuard] },
      { path: 'finish',         component: StepFinish,          canActivate: [wizardFinishGuard] },
      { path: '', redirectTo: 'recommandation', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Page de connexion (publique)
  { path: 'login', component: Login },

  // Suivi de dossier (publique)
  {
    path: 'suivi',
    loadComponent: () => import('./pages/suivi/suivi').then(m => m.Suivi)
  },


  // Routes admin protégées par le guard
  {
    path: 'admin',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'filieres',
        canActivate: [adminOnlyGuard],
        loadComponent: () =>
          import('./admin/filieres/filieres')
            .then(m => m.Filieres)
      },
      {
        path: 'ecoles',
        canActivate: [adminOnlyGuard],
        loadComponent: () =>
          import('./admin/ecoles/ecoles')
            .then(m => m.EcolesAdmin)
      },
      {
        path: 'parametres',
        canActivate: [adminOnlyGuard],
        loadComponent: () =>
          import('./admin/parametres/parametres')
            .then(m => m.ParametresComponent)
      },
      {
  path: 'annonces',
  loadComponent: () =>
    import('./admin/annonces/annonces')
      .then(m => m.Annonces)
},
      {
        path: 'inscriptions',
        loadComponent: () =>
          import('./admin/inscriptions/inscriptions')
            .then(m => m.Inscriptions)
      },
      {
        path: 'inscriptions/:id',
        loadComponent: () =>
          import('./admin/inscriptions/inscription-detail/inscription-detail')
            .then(m => m.InscriptionDetail)
      },
      {
        path: 'candidats',
        loadComponent: () =>
          import('./admin/candidats/candidats')
            .then(m => m.Candidats)
      },
      {
        path: 'candidats/:id',
        loadComponent: () =>
          import('./admin/candidats/candidat-detail/candidat-detail')
            .then(m => m.CandidatDetail)
      },
      {
        path: 'pays',
        canActivate: [adminOnlyGuard],
        loadComponent: () =>
          import('./admin/pays/pays')
            .then(m => m.Pays)
      },
      {
        path: 'centres',
        canActivate: [adminOnlyGuard],
        loadComponent: () =>
          import('./admin/centres/centres')
            .then(m => m.Centres)
      },
      {
        path: 'cursus',
        canActivate: [adminOnlyGuard],
        loadComponent: () => import('./admin/cursus/cursus').then(m => m.CursusAdmin)
      },
      {
        path: 'niveaux',
        canActivate: [adminOnlyGuard],
        loadComponent: () => import('./admin/niveaux/niveaux').then(m => m.NiveauxAdmin)
      },
      {
        path: 'diplomes',
        canActivate: [adminOnlyGuard],
        loadComponent: () => import('./admin/diplomes/diplomes').then(m => m.DiplomesAdmin)
      },
      {
        path: 'regions',
        canActivate: [adminOnlyGuard],
        loadComponent: () => import('./admin/regions/regions').then(m => m.RegionsAdmin)
      },
      {
        path: 'departements',
        canActivate: [adminOnlyGuard],
        loadComponent: () => import('./admin/departements/departements').then(m => m.DepartementsAdmin)
      },
      {
        path: 'sessions',
        canActivate: [adminOnlyGuard],
        loadComponent: () =>
          import('./admin/sessions/sessions')
            .then(m => m.Sessions)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }

    ]
  },

  // Page erreur serveur (accessible depuis l'intercepteur d'erreurs)
  {
    path: '500',
    loadComponent: () => import('./pages/server-error/server-error').then(m => m.ServerError)
  },

  // 404 — doit rester en dernier
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound)
  }



];



