import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatParFiliere } from '../../core/models/api-response.models';
import { BarChart, BarItem } from '../../shared/bar-chart/bar-chart';

const PALETTE = [
  '#2980b9', '#27ae60', '#f59e0b', '#e74c3c',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'
];

@Component({
  selector: 'app-repartition-filieres',
  standalone: true,
  imports: [CommonModule, BarChart],
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-titre">Répartition par filière</h3>
        <span class="chart-badge">{{ items.length }} filières</span>
      </div>
      @if (items.length > 0) {
        <app-bar-chart [items]="items"></app-bar-chart>
      } @else {
        <div class="chart-vide">Aucune donnée disponible</div>
      }
    </div>
  `,
  styles: [`
    .chart-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 20px;
      box-shadow: var(--shadow-card);
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .chart-titre { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
    .chart-badge {
      font-size: 12px;
      background: var(--bg-hover);
      color: var(--text-secondary);
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
    }
    .chart-vide { text-align: center; padding: 30px 20px; color: var(--text-muted); font-size: 13px; }
  `]
})
export class RepartitionFilieres implements OnChanges {
  @Input() parFiliere: StatParFiliere[] = [];

  items: BarItem[] = [];

  ngOnChanges(): void {
    this.items = this.parFiliere
      .slice()
      .sort((a, b) => b.nombre - a.nombre)
      .slice(0, 8)
      .map((f, i) => ({
        label: f.filiere,
        value: f.nombre,
        color: PALETTE[i % PALETTE.length]
      }));
  }
}
