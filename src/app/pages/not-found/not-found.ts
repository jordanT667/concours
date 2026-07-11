import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {
  constructor(private router: Router) {}
  retour(): void { this.router.navigate(['/login']); }
}
