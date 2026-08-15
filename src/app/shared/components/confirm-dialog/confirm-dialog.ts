import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (ouvert) {
      <div class="modal-overlay" (click)="annuler.emit()">
        <div class="modal modal-confirm" (click)="$event.stopPropagation()" role="alertdialog" aria-modal="true" [attr.aria-labelledby]="'confirm-title'">
          <h3 id="confirm-title">{{ titre }}</h3>
          <p>{{ message }}</p>
          @if (detail) { <p class="confirm-detail">{{ detail }}</p> }
          <div class="modal-actions">
            <button type="button" class="btn-annuler" (click)="annuler.emit()">Annuler</button>
            <button type="button" [class]="'btn-confirmer ' + classBouton" (click)="confirmer.emit()">{{ texteBouton }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
    .modal-confirm {
      background: var(--bg-card, #fff); border-radius: 12px; padding: 1.5rem;
      max-width: 420px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,.3);
    }
    .modal-confirm h3 { margin: 0 0 .5rem; font-size: 1.1rem; }
    .modal-confirm p { margin: .25rem 0; color: var(--text-secondary, #666); font-size: .9rem; }
    .confirm-detail { font-style: italic; opacity: .8; }
    .modal-actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: 1.25rem; }
    .btn-annuler {
      padding: .5rem 1rem; border: 1px solid var(--border, #ddd); border-radius: 8px;
      background: transparent; cursor: pointer; font-size: .85rem;
    }
    .btn-confirmer {
      padding: .5rem 1rem; border: none; border-radius: 8px;
      color: #fff; cursor: pointer; font-weight: 600; font-size: .85rem;
    }
    .btn-danger { background: #ef4444; }
    .btn-danger:hover { background: #dc2626; }
    .btn-success { background: #22c55e; }
    .btn-success:hover { background: #16a34a; }
    .btn-warning { background: #f59e0b; }
    .btn-warning:hover { background: #d97706; }
  `]
})
export class ConfirmDialog {
  @Input() ouvert = false;
  @Input() titre = 'Confirmation';
  @Input() message = 'Êtes-vous sûr ?';
  @Input() detail = '';
  @Input() texteBouton = 'Confirmer';
  @Input() classBouton = 'btn-danger';
  @Output() confirmer = new EventEmitter<void>();
  @Output() annuler = new EventEmitter<void>();
}
