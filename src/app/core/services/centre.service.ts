import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Centre } from '../models/centre.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CentreService {
  private readonly API = `${environment.apiUrl}/centres`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Centre[]> {
    return this.http.get<Centre[]>(this.API);
  }

  create(centre: Centre): Observable<Centre> {
    return this.http.post<Centre>(this.API, centre);
  }

  update(id: number, centre: Centre): Observable<Centre> {
    return this.http.put<Centre>(`${this.API}/${id}`, centre);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
