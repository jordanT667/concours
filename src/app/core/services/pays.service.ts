import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaysDto } from '../models/pays.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaysService {
  private readonly API = `${environment.apiUrl}/pays`;

  constructor(private http: HttpClient) {}

  getActifs(): Observable<PaysDto[]> {
    return this.http.get<PaysDto[]>(`${this.API}/actifs`);
  }

  create(pays: PaysDto): Observable<PaysDto> {
    return this.http.post<PaysDto>(this.API, pays);
  }

  update(codePays: string, pays: PaysDto): Observable<PaysDto> {
    return this.http.put<PaysDto>(`${this.API}/${codePays}`, pays);
  }

  desactiver(codePays: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/${codePays}/desactiver`, {});
  }

  delete(codePays: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${codePays}`);
  }
}
