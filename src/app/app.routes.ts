import { Routes } from '@angular/router';
import { WizardComponent } from './pages/wizard/wizard';

import { StepRecommandation } from './pages/wizard/step-reccommandation/step-reccommandation';
import { StepIdentification } from './pages/wizard/step-identification/step-identification';
import { StepSpecialisation } from './pages/wizard/step-specialisation/step-specialisation';
import { StepCursus } from './pages/wizard/step-cursus/step-cursus';
import { StepContacts } from './pages/wizard/step-contacts/step-contacts';
import { StepFinish } from './pages/wizard/step-finish/step-finish';
import { Login } from './auth/login/login';
import { authGuard } from './core/guards/guard-guard';
import { Dashboard } from './admin/dashboard/dashboard';
import { Layout } from './layout/layout';


export const routes: Routes = [

  {
    path: 'inscription',
    component: WizardComponent,
    children: [
      { path: 'recommandation', component: StepRecommandation },
      { path: 'identification', component: StepIdentification },
      { path: 'specialisation', component: StepSpecialisation },
      { path: 'cursus',         component: StepCursus },
      { path: 'contacts',       component: StepContacts },
      { path: 'finish',         component: StepFinish },
      { path: '', redirectTo: 'recommandation', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Page de connexion (publique)
  { path: 'login', component: Login },


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
        loadComponent: () =>
          import('./admin/filieres/filieres')
            .then(m => m.Filieres)
      },
{
  path: 'parametres',
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
        path: 'candidats',
        loadComponent: () =>
          import('./admin/candidats/candidats')
            .then(m => m.Candidats)
      },
      {
        path: 'pays',
        loadComponent: () =>
          import('./admin/pays/pays')
            .then(m => m.Pays)
      },
      {
        path: 'centres',
        loadComponent: () =>
          import('./admin/centres/centres')
            .then(m => m.Centres)
      },
      {
        path: 'cursus',
        loadComponent: () => import('./admin/cursus/cursus').then(m => m.CursusAdmin)
      },
      {
        path: 'niveaux',
        loadComponent: () => import('./admin/niveaux/niveaux').then(m => m.NiveauxAdmin)
      },
      {
        path: 'diplomes',
        loadComponent: () => import('./admin/diplomes/diplomes').then(m => m.DiplomesAdmin)
      },
      {
        path: 'regions',
        loadComponent: () => import('./admin/regions/regions').then(m => m.RegionsAdmin)
      },
      {
        path: 'departements',
        loadComponent: () => import('./admin/departements/departements').then(m => m.DepartementsAdmin)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }

    ]
  },

  { path: '**', redirectTo: 'login' }



];



