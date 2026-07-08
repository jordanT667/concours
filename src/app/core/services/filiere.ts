import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filiere, Departement } from '../models/filiere.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FiliereService {
  private readonly API = `${environment.apiUrl}/filieres`;
  private readonly API_DEPT = `${environment.apiUrl}/departements`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(this.API);
  }

  getDepartements(): Observable<Departement[]> {
    return this.http.get<Departement[]>(this.API_DEPT);
  }

  create(filiere: Filiere): Observable<Filiere> {
    return this.http.post<Filiere>(this.API, filiere);
  }

  update(id: number, filiere: Filiere): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.API}/${id}`, filiere);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
