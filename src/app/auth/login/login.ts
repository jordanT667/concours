import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';
import { ErrorResponse, ErrorCode } from '../../core/models/error-response.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  matricule: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.matricule || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;

    // Authentification 
    this.authService.login({ username: this.matricule, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: ErrorResponse | any) => {
        this.isLoading = false;
        const code = (err as ErrorResponse)?.code;
        if (code === ErrorCode.UNAUTHORIZED) {
          this.errorMessage = 'Matricule ou mot de passe incorrect.';
        } else if (code === ErrorCode.FORBIDDEN_ACCESS) {
          this.errorMessage = 'Accès refusé.';
        } else if (code === ErrorCode.SERVICE_UNAVAILABLE || err?.status === 0) {
          this.errorMessage = 'Serveur inaccessible. Vérifiez votre connexion.';
        } else {
          this.errorMessage = (err as ErrorResponse)?.message ?? 'Une erreur est survenue.';
        }
      }
    });
  }
}