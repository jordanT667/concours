import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  label: string;
  route: string;
  icone: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  @Output() closeSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { label: 'Dashboard',    route: '/admin/dashboard',   icone: 'chart-bar'      },
    { label: 'Inscriptions', route: '/admin/inscriptions', icone: 'clipboard-list' },
    { label: 'Candidats',    route: '/admin/candidats',   icone: 'users'          },
    { label: 'Centres',      route: '/admin/centres',     icone: 'map-pin'        },
    { label: 'Pays',         route: '/admin/pays',        icone: 'globe'          },
    { label: 'Filières',     route: '/admin/filieres',    icone: 'academic-cap'   },
    { label: 'Résultats',    route: '/admin/resultats',   icone: 'trophy'         },
    { label: 'Paramètres',   route: '/admin/parametres',  icone: 'cog'            },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onNavClick(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
