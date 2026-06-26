import { Routes } from '@angular/router';
import { WizardComponent } from './pages/wizard/wizard';
import { StepRecommandation } from './pages/wizard/step-recommandation/step-recommandation';


import { StepIdentification } from './pages/wizard/step-identification/step-identification';
import { StepSpecialisation } from './pages/wizard/step-specialisation/step-specialisation';
import { StepCursus } from './pages/wizard/step-cursus/step-cursus';
import { StepContacts } from './pages/wizard/step-contacts/step-contacts';
import { StepFinish } from './pages/wizard/step-finish/step-finish';

export const routes: Routes = [
  {
    path: 'inscription',
    component: WizardComponent,
    children: [
      { path: 'recommandation', component: StepRecommandation },
      { path: 'identification', component: StepIdentification },
      { path: 'specialisation', component: StepSpecialisation },
      { path: 'cursus', component: StepCursus },
      { path: 'contacts', component: StepContacts },
      { path: 'finish', component: StepFinish },

      { path: '', redirectTo: 'recommandation', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/inscription', pathMatch: 'full' },
  { path: '**', redirectTo: '/inscription' }
];

