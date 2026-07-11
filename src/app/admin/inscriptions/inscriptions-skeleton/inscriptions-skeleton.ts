import { Component } from '@angular/core';

@Component({
  selector: 'app-inscriptions-skeleton',
  standalone: true,
  template: `
    <!-- Barre filtres -->
    <div class="sk-filtres">
      <div class="skeleton sk-rect" style="flex:2;height:38px;border-radius:6px"></div>
      <div class="skeleton sk-rect" style="flex:1;height:38px;border-radius:6px"></div>
      <div class="skeleton sk-rect" style="flex:1;height:38px;border-radius:6px"></div>
    </div>
    <!-- Tableau -->
    <div class="sk-table-wrap">
      <div class="sk-thead">
        @for (w of headers; track $index) {
          <div class="skeleton sk-rect sk-th" [style.width]="w"></div>
        }
      </div>
      @for (_ of rows; track $index) {
        <div class="sk-row">
          @for (w of headers; track $index) {
            <div class="skeleton sk-rect sk-td" [style.width]="w"></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 16px; }
    .sk-filtres { display: flex; gap: 12px; }
    .sk-table-wrap {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: var(--shadow-card);
    }
    .sk-thead {
      display: flex; gap: 12px; padding: 14px 16px;
      background: var(--bg-hover);
      border-bottom: 1px solid var(--border-color);
    }
    .sk-row {
      display: flex; gap: 12px; padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .sk-row:last-child { border-bottom: none; }
    .sk-th { height: 12px; border-radius: 4px; flex-shrink: 0; }
    .sk-td { height: 14px; border-radius: 4px; flex-shrink: 0; }
  `]
})
export class InscriptionsSkeleton {
  headers = ['90px', '160px', '120px', '110px', '110px', '100px', '80px', '80px'];
  rows = Array(8);
}
