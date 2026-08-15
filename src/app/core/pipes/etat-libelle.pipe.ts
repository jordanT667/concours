import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'etatLibelle', standalone: true })
export class EtatLibellePipe implements PipeTransform {
  transform(etat?: string): string {
    switch (etat) {
      case 'E': return 'Soumis';
      case 'V': return 'Vérification';
      case 'S': return 'Sélectionné';
      case 'R': return 'Rejeté';
      default: return '—';
    }
  }
}
