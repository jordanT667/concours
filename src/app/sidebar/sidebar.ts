import { Component, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth';

interface MenuItem {
  label: string;
  route: string;
  icone: string;
  separateur?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  @Output() closeSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { label: 'Dashboard',      route: '/admin/dashboard',    icone: 'chart-bar'      },
    { label: 'Inscriptions',   route: '/admin/inscriptions', icone: 'clipboard-list' },
    { label: 'Candidats',      route: '/admin/candidats',    icone: 'users'          },
    { label: 'Résultats',      route: '/admin/resultats',    icone: 'trophy'         },

    { label: 'Référentiels', route: '', icone: '', separateur: true },

    { label: 'Pays',           route: '/admin/pays',         icone: 'globe'          },
    { label: 'Régions',        route: '/admin/regions',      icone: 'map-pin'        },
    { label: 'Départements',   route: '/admin/departements', icone: 'location'       },
    { label: 'Cursus',         route: '/admin/cursus',       icone: 'academic-cap'   },
    { label: 'Niveaux',        route: '/admin/niveaux',      icone: 'bars'           },
    { label: 'Diplômes',       route: '/admin/diplomes',     icone: 'document'       },
    { label: 'Filières',       route: '/admin/filieres',     icone: 'book'           },
    { label: 'Centres',        route: '/admin/centres',      icone: 'building'       },

    { label: 'Paramètres',     route: '/admin/parametres',   icone: 'cog'            },
  ];

  constructor(private router: Router, private authService: AuthService) {}

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
