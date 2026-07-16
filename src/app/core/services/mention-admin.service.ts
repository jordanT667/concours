import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MentionDto } from '../models/referentiel.models';

@Injectable({ providedIn: 'root' })
export class MentionAdminService {
  private readonly PUB = `${environment.apiUrl}/concours/mentions`;
  private readonly API = `${environment.apiUrl}/mentions`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<MentionDto[]> { return this.http.get<MentionDto[]>(this.PUB); }
  create(dto: MentionDto): Observable<MentionDto> { return this.http.post<MentionDto>(this.API, dto); }
  update(idMention: string, dto: MentionDto): Observable<MentionDto> { return this.http.put<MentionDto>(`${this.API}/${idMention}`, dto); }
  delete(idMention: string): Observable<void> { return this.http.delete<void>(`${this.API}/${idMention}`); }
}
