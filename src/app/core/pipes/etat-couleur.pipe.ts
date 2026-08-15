import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'etatCouleur', standalone: true })
export class EtatCouleurPipe implements PipeTransform {
  transform(etat?: string): string {
    switch (etat) {
      case 'S': return 'badge-vert';
      case 'R': return 'badge-rouge';
      case 'V': return 'badge-bleu';
      default: return 'badge-orange';
    }
  }
}
