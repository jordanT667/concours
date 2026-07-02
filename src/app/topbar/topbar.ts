import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar implements OnInit {

  @Output() toggleSidebar = new EventEmitter<void>();

  nomAdmin: string = '';
  initiales: string = '';
  menuOuvert: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.nomAdmin = `${user.prenom} ${user.nom}`;
      this.initiales = this.calculerInitiales(this.nomAdmin);
    }
  }

  calculerInitiales(nom: string): string {
    return nom
      .split(' ')
      .map(mot => mot[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleMenu(): void {
    this.menuOuvert = !this.menuOuvert;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
