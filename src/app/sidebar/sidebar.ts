import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth';

interface MenuItem {
  label: string;
  route: string;
  icone: string;
  separateur?: boolean;
  adminOnly?: boolean;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard',      route: '/admin/dashboard',    icone: 'chart-bar'      },
  { label: 'Inscriptions',   route: '/admin/inscriptions', icone: 'clipboard-list' },
  { label: 'Candidats',      route: '/admin/candidats',    icone: 'users'          },
  { label: 'Annonces',       route: '/admin/annonces',     icone: 'bell'           },

  { label: 'Référentiels', route: '', icone: '', separateur: true, adminOnly: true },

  { label: 'Pays',           route: '/admin/pays',         icone: 'globe',           adminOnly: true },
  { label: 'Régions',        route: '/admin/regions',      icone: 'map-pin',         adminOnly: true },
  { label: 'Départements',   route: '/admin/departements', icone: 'location',        adminOnly: true },
  { label: 'Cursus',         route: '/admin/cursus',       icone: 'academic-cap',    adminOnly: true },
  { label: 'Niveaux',        route: '/admin/niveaux',      icone: 'bars',            adminOnly: true },
  { label: 'Diplômes',       route: '/admin/diplomes',     icone: 'document',        adminOnly: true },
  { label: 'Écoles',         route: '/admin/ecoles',       icone: 'building-library',adminOnly: true },
  { label: 'Filières',       route: '/admin/filieres',     icone: 'book',            adminOnly: true },
  { label: 'Centres',        route: '/admin/centres',      icone: 'building',        adminOnly: true },
  { label: 'Séries',         route: '/admin/series',       icone: 'document',        adminOnly: true },
  { label: 'Banques',        route: '/admin/banques',      icone: 'building-library',adminOnly: true },
  { label: 'Sports',         route: '/admin/sports',       icone: 'trophy',          adminOnly: true },
  { label: 'Loisirs',        route: '/admin/loisirs',      icone: 'trophy',          adminOnly: true },
  { label: 'Handicaps',      route: '/admin/handicaps',    icone: 'users',           adminOnly: true },
  { label: 'Mentions',       route: '/admin/mentions',     icone: 'academic-cap',    adminOnly: true },
  { label: 'Sites dépôt',    route: '/admin/sites-depot',  icone: 'map-pin',         adminOnly: true },
  { label: 'Centres exam.',  route: '/admin/centres-examen', icone: 'building',      adminOnly: true },
  { label: 'Matières',       route: '/admin/matieres',     icone: 'book',            adminOnly: true },
  { label: 'Épreuves',       route: '/admin/epreuves',     icone: 'bars',            adminOnly: true },

  { label: 'Sessions',       route: '/admin/sessions',     icone: 'lock-open',       adminOnly: true },
  { label: 'Paramètres',     route: '/admin/parametres',   icone: 'cog',             adminOnly: true },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  @Output() closeSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [];

  constructor(private router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    this.menuItems = this.authService.isAdmin()
      ? ALL_MENU_ITEMS
      : ALL_MENU_ITEMS.filter(item => !item.adminOnly);
  }

  onNavClick(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
