import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-skeleton',
  standalone: true,
  template: `
    <!-- 4 cartes stats -->
    <div class="sk-stats-grid">
      @for (_ of [1,2,3,4]; track $index) {
        <div class="sk-card">
          <div class="skeleton sk-rect" style="width:40px;height:40px;border-radius:10px"></div>
          <div style="flex:1">
            <div class="skeleton sk-line short"></div>
            <div class="skeleton sk-rect" style="width:70%;height:28px;border-radius:4px"></div>
          </div>
        </div>
      }
    </div>

    <!-- Ligne du milieu -->
    <div class="sk-mid-grid">
      <div class="sk-card" style="flex:1;min-height:200px">
        <div class="skeleton sk-line medium"></div>
        @for (_ of [1,2,3,4]; track $index) {
          <div class="skeleton sk-line full"></div>
        }
      </div>
      <div class="sk-card" style="width:340px;min-height:200px">
        <div class="skeleton sk-line short"></div>
        <div class="skeleton sk-rect" style="height:140px;border-radius:8px"></div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="sk-actions-grid">
      @for (_ of [1,2,3,4]; track $index) {
        <div class="sk-card" style="height:60px"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 24px; }
    .sk-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .sk-card {
      display: flex; align-items: center; gap: 14px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      box-shadow: var(--shadow-card);
    }
    .sk-mid-grid {
      display: flex; gap: 20px; align-items: flex-start;
    }
    .sk-actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    @media (max-width: 1024px) {
      .sk-stats-grid { grid-template-columns: repeat(2,1fr); }
      .sk-mid-grid { flex-direction: column; }
      .sk-mid-grid > :last-child { width: 100% !important; }
    }
    @media (max-width: 640px) {
      .sk-stats-grid { grid-template-columns: 1fr 1fr; }
      .sk-actions-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class DashboardSkeleton {}
