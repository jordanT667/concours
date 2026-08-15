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
  { label: 'Dashboard',      route: '/admin/dashboard',      icone: 'chart-pie'            },
  { label: 'Inscriptions',   route: '/admin/inscriptions',   icone: 'clipboard-check'      },
  { label: 'Candidats',      route: '/admin/candidats',      icone: 'users'                },
  { label: 'Annonces',       route: '/admin/annonces',       icone: 'newspaper'            },

  { label: 'Référentiels', route: '', icone: '', separateur: true, adminOnly: true },

  { label: 'Cursus',         route: '/admin/cursus',         icone: 'sitemap',           adminOnly: true },
  { label: 'Niveaux',        route: '/admin/niveaux',        icone: 'stairs',            adminOnly: true },
  { label: 'Filières',       route: '/admin/filiere',        icone: 'diagram-project',   adminOnly: true },
  { label: 'Pays',           route: '/admin/pays',           icone: 'flag',              adminOnly: true },
  { label: 'Régions',        route: '/admin/regions',        icone: 'map',               adminOnly: true },
  { label: 'Départements',   route: '/admin/departements',   icone: 'map-pin',           adminOnly: true },
  { label: 'Diplômes',       route: '/admin/diplomes',       icone: 'certificate',       adminOnly: true },
  { label: 'Écoles',         route: '/admin/ecoles',         icone: 'school',            adminOnly: true },
  { label: 'Centres',        route: '/admin/centres',        icone: 'building',          adminOnly: true },
  { label: 'Séries',         route: '/admin/series',         icone: 'list-check',        adminOnly: true },
  { label: 'Banques',        route: '/admin/banques',        icone: 'university',        adminOnly: true },
  { label: 'Sports',         route: '/admin/sports',         icone: 'person-running',    adminOnly: true },
  { label: 'Loisirs',        route: '/admin/loisirs',        icone: 'palette',           adminOnly: true },
  { label: 'Handicaps',      route: '/admin/handicaps',      icone: 'hand-holding-heart', adminOnly: true },
  { label: 'Mentions',       route: '/admin/mentions',       icone: 'star',              adminOnly: true },
  { label: 'Sites dépôt',    route: '/admin/sites-depot',    icone: 'warehouse',         adminOnly: true },
  { label: 'Centres exam.',  route: '/admin/centres-examen', icone: 'building-flag',     adminOnly: true },
  { label: 'Matières',       route: '/admin/matieres',       icone: 'flask',             adminOnly: true },
  { label: 'Épreuves',       route: '/admin/epreuves',       icone: 'pen-ruler',         adminOnly: true },

  { label: 'Sessions',       route: '/admin/sessions',       icone: 'toggle-on',         adminOnly: true },
  { label: 'Paramètres',     route: '/admin/parametres',     icone: 'sliders',           adminOnly: true },
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
