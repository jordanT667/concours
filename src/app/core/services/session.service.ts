import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionDto } from '../models/session.models';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly API = `${environment.apiUrl}/session/sessions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SessionDto[]> {
    return this.http.get<SessionDto[]>(this.API);
  }

  revoke(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${sessionId}`);
  }
}
