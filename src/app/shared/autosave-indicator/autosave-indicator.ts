import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutosaveStatus } from '../../core/services/autosave.service';

@Component({
  selector: 'app-autosave-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (status && status !== 'idle') {
      <span class="autosave-indicator" [class]="'autosave-' + status">
        @switch (status) {
          @case ('saving') {
            <span class="autosave-spinner"></span>
            Enregistrement en cours...
          }
          @case ('saved') {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
            </svg>
            Enregistré
          }
          @case ('error') {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71
                   c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                   0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            </svg>
            Échec de l'enregistrement
          }
        }
      </span>
    }
  `,
  styles: [`
    .autosave-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 20px;
      transition: all 0.3s;
      animation: fadeSlide 0.25s ease;
    }

    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .autosave-indicator svg { width: 13px; height: 13px; flex-shrink: 0; }

    .autosave-saving {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }

    .autosave-saved {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    .autosave-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .autosave-spinner {
      width: 11px;
      height: 11px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AutosaveIndicator {
  @Input() status: AutosaveStatus | null = 'idle';
}
