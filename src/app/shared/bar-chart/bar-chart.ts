import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BarItem {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-chart">
      @for (item of computed; track item.label) {
        <div class="bar-row">
          <span class="bar-label" [title]="item.label">{{ item.label }}</span>
          <div class="bar-track">
            <div class="bar-fill"
              [style.width.%]="item.pct"
              [style.background]="item.color || defaultColor">
            </div>
          </div>
          <span class="bar-value">{{ item.value }}</span>
        </div>
      }
      @if (computed.length === 0) {
        <p class="bar-empty">Aucune donnée</p>
      }
    </div>
  `,
  styles: [`
    .bar-chart { display: flex; flex-direction: column; gap: 10px; }

    .bar-row {
      display: grid;
      grid-template-columns: 110px 1fr 40px;
      align-items: center;
      gap: 10px;
    }

    .bar-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-track {
      height: 8px;
      background: var(--border-color);
      border-radius: 6px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      min-width: 4px;
    }

    .bar-value {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
      text-align: right;
    }

    .bar-empty {
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
      padding: 20px 0;
    }
  `]
})
export class BarChart implements OnChanges {
  @Input() items: BarItem[] = [];
  readonly defaultColor = '#2980b9';

  computed: (BarItem & { pct: number })[] = [];

  ngOnChanges(): void {
    const max = Math.max(...this.items.map(i => i.value), 1);
    this.computed = this.items.map(item => ({
      ...item,
      pct: Math.round((item.value / max) * 100)
    }));
  }
}
