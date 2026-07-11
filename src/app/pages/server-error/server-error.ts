import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  templateUrl: './server-error.html',
  styleUrl: './server-error.css'
})
export class ServerError {
  constructor(private router: Router) {}
  retour(): void  { this.router.navigate(['/login']); }
  recharger(): void { window.location.reload(); }
}
