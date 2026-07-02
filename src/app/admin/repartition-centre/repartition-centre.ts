import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatParCentre } from '../../core/models/api-response.models';

@Component({
  selector: 'app-repartition-centres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repartition-centre.html',
  styleUrl: './repartition-centre.css',
})
export class RepartitionCentres {

  @Input() parCentre: StatParCentre[] = [];

  get total(): number {
    return this.parCentre.reduce((acc, c) => acc + c.nombre, 0);
  }

  pourcentage(nombre: number): number {
    return this.total > 0
      ? Math.round((nombre / this.total) * 100)
      : 0;
  }

  largeurBarre(nombre: number): string {
    return `${this.pourcentage(nombre)}%`;
  }
}