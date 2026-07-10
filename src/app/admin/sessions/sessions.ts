import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SessionService } from '../../core/services/session.service';
import { SessionDto } from '../../core/models/session.models';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './sessions.html',
  styleUrl: './sessions.css'
})
export class Sessions implements OnInit {
  liste: SessionDto[] = [];
  isLoading = false;
  erreur = '';
  confirmSession: SessionDto | null = null;

  constructor(private svc: SessionService) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.isLoading = true;
    this.svc.getAll().subscribe({
      next: data => { this.liste = data; this.isLoading = false; },
      error: (err: any) => { this.erreur = err?.message ?? 'Erreur de chargement.'; this.isLoading = false; }
    });
  }

  demanderRevocation(s: SessionDto): void { this.confirmSession = s; }

  annulerRevocation(): void { this.confirmSession = null; }

  confirmerRevocation(): void {
    if (!this.confirmSession) return;
    const id = this.confirmSession.sessionId;
    this.confirmSession = null;
    this.svc.revoke(id).subscribe({
      next: () => this.charger(),
      error: (err: any) => { this.erreur = err?.message ?? 'Révocation impossible.'; }
    });
  }

  iconeAppareil(deviceClass: string | undefined): string {
    switch (deviceClass?.toLowerCase()) {
      case 'phone':  return 'fa-mobile-alt';
      case 'tablet': return 'fa-tablet-alt';
      default:       return 'fa-desktop';
    }
  }
}
