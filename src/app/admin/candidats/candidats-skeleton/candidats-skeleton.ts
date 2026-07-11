import { Component } from '@angular/core';

@Component({
  selector: 'app-candidats-skeleton',
  standalone: true,
  template: `
    <!-- Barre filtres -->
    <div class="sk-filtres">
      <div class="skeleton sk-rect" style="flex:1;height:38px;border-radius:6px"></div>
      <div class="skeleton sk-rect" style="width:160px;height:38px;border-radius:6px"></div>
    </div>
    <!-- Grille cartes -->
    <div class="sk-grille">
      @for (_ of items; track $index) {
        <div class="sk-card">
          <div class="skeleton sk-rect sk-avatar"></div>
          <div class="sk-infos">
            <div class="skeleton sk-line medium"></div>
            <div class="skeleton sk-line short"></div>
            <div class="skeleton sk-line full"></div>
          </div>
          <div class="skeleton sk-rect sk-badge"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 16px; }
    .sk-filtres { display: flex; gap: 12px; }
    .sk-grille {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
    .sk-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: var(--shadow-card);
    }
    .sk-avatar {
      width: 52px; height: 52px;
      border-radius: 50%;
      align-self: center;
    }
    .sk-infos { display: flex; flex-direction: column; gap: 8px; }
    .sk-badge { height: 24px; width: 80px; border-radius: 12px; align-self: flex-end; }
  `]
})
export class CandidatsSkeleton {
  items = Array(8);
}
