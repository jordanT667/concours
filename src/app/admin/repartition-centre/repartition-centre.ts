import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatParCentre } from '../../core/models/api-response.models';
import { DonutChart, DonutSlice } from '../../shared/donut-chart/donut-chart';

const PALETTE = [
  '#2980b9', '#27ae60', '#f59e0b', '#e74c3c',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
  '#10b981', '#6366f1', '#84cc16', '#14b8a6'
];

@Component({
  selector: 'app-repartition-centres',
  standalone: true,
  imports: [CommonModule, DonutChart],
  templateUrl: './repartition-centre.html',
  styleUrl: './repartition-centre.css',
})
export class RepartitionCentres implements OnChanges {
  @Input() parCentre: StatParCentre[] = [];

  slices: DonutSlice[] = [];

  ngOnChanges(): void {
    this.slices = this.parCentre
      .slice()
      .sort((a, b) => b.nombre - a.nombre)
      .map((c, i) => ({
        label: c.centre,
        value: c.nombre,
        color: PALETTE[i % PALETTE.length]
      }));
  }
}
