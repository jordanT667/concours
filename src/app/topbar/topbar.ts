import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar implements OnInit {

  @Output() toggleSidebar = new EventEmitter<void>();

  nomAdmin: string = '';
  initiales: string = '';
  roleBadge: string = '';
  menuOuvert: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const prenom = user.prenom ?? '';
        const nom = user.nom ?? user.username ?? '';
        this.nomAdmin = `${prenom} ${nom}`.trim();
        this.initiales = this.calculerInitiales(this.nomAdmin);
      } catch {}
    }
    this.roleBadge = this.authService.isAdmin() ? 'Admin' : 'Saisie';
  }

  calculerInitiales(nom: string): string {
    const mots = nom.split(' ').filter(m => m.length > 0);
    if (mots.length === 0) return '?';
    return mots.map(m => m[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleMenu(): void {
    this.menuOuvert = !this.menuOuvert;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar-profil')) {
      this.menuOuvert = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
