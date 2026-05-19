import { Routes } from '@angular/router';
import { WizardComponent } from './pages/wizard/wizard';
import { StepRecommandationComponent } from './pages/wizard/step-recommandation/step-recommandation';

export const routes: Routes = [
  {
    path: 'inscription',
    component: WizardComponent,
    children: [
      { path: 'recommandation', component: StepRecommandationComponent },
      // Les autres étapes seront ajoutées progressivement :
      // { path: 'identification', component: StepIdentificationComponent },
      // { path: 'specialisation', component: StepSpecialisationComponent },
      // { path: 'cursus',         component: StepCursusComponent },
      // { path: 'contacts',       component: StepContactsComponent },
      // { path: 'finish',         component: StepFinishComponent },
      { path: '', redirectTo: 'recommandation', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/inscription', pathMatch: 'full' },
  { path: '**', redirectTo: '/inscription' }
];
