// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginRequest, JwtResponse } from '../core/models/auth-models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('user', JSON.stringify({ id: res.id, username: res.username, roles: res.roles }));
      })
    );
  }

  logout(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';
    return this.http.post(`${this.API}/logout`, { refreshToken }).pipe(
      tap(() => this.clearSession())
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';
    return this.http.post(`${this.API}/refresh`, { refreshToken }).pipe(
      tap((res: any) => localStorage.setItem('accessToken', res.accessToken))
    );
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
  getRoles(): string[] {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).roles : [];
  }

  isAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }

  isSaisie(): boolean {
    return this.getRoles().includes('SAISIE');
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  getUsername(): string {
    const user = localStorage.getItem('user');
    return user ? (JSON.parse(user).username ?? '') : '';
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}
