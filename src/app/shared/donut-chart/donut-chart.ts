import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface ComputedSlice extends DonutSlice {
  pct: number;
  offset: number;
  dash: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="donut-wrap">
      <svg viewBox="0 0 120 120" class="donut-svg" aria-hidden="true">
        <!-- Fond gris -->
        <circle cx="60" cy="60" r="54"
          fill="none" stroke="var(--border-color)" stroke-width="14"/>
        <!-- Segments -->
        @for (s of computed; track s.label) {
          <circle cx="60" cy="60" r="54"
            fill="none"
            [attr.stroke]="s.color"
            stroke-width="14"
            stroke-linecap="round"
            [attr.stroke-dasharray]="s.dash + ' ' + (circumference - s.dash)"
            [attr.stroke-dashoffset]="s.offset"
            transform="rotate(-90 60 60)"/>
        }
        <!-- Centre -->
        <text x="60" y="56" text-anchor="middle" class="donut-total-num">{{ total }}</text>
        <text x="60" y="70" text-anchor="middle" class="donut-total-lab">total</text>
      </svg>

      <!-- Légende -->
      <div class="donut-legend">
        @for (s of computed; track s.label) {
          <div class="legend-item">
            <span class="legend-dot" [style.background]="s.color"></span>
            <span class="legend-label">{{ s.label }}</span>
            <span class="legend-val">{{ s.value }} <span class="legend-pct">({{ s.pct }}%)</span></span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .donut-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .donut-svg {
      width: 160px;
      height: 160px;
      overflow: visible;
    }

    .donut-total-num {
      font-size: 22px;
      font-weight: 800;
      fill: var(--text-primary);
      font-family: inherit;
    }

    .donut-total-lab {
      font-size: 9px;
      font-weight: 600;
      fill: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: inherit;
    }

    .donut-legend {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .legend-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }

    .legend-val {
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .legend-pct { font-weight: 400; color: var(--text-muted); }
  `]
})
export class DonutChart implements OnChanges {
  @Input() slices: DonutSlice[] = [];

  readonly circumference = CIRCUMFERENCE;
  computed: ComputedSlice[] = [];
  total = 0;

  ngOnChanges(): void {
    this.total = this.slices.reduce((s, c) => s + c.value, 0);
    if (this.total === 0) { this.computed = []; return; }

    let cumPct = 0;
    this.computed = this.slices.map(s => {
      const pct = s.value / this.total;
      const dash = pct * CIRCUMFERENCE;
      const offset = CIRCUMFERENCE - cumPct * CIRCUMFERENCE;
      cumPct += pct;
      return { ...s, pct: Math.round(pct * 100), dash, offset };
    });
  }
}
