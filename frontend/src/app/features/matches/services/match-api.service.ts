import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Match, MatchStatus } from '../../../core/models/match.model';
import { ApiResponse } from '../../../core/models/api-error.model';
import { environment } from '../../../../environments/environment';

export interface AcceptMatchResponse {
  match: Match;
  handoverId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatchApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl || '/api';
  private apiUrl = `${this.baseUrl}/matches`;

  getAll(
    status?: MatchStatus | string,
    page = 1,
    limit = 20,
    all = false
  ): Observable<{ data: Match[]; pagination?: any }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (all) {
      params = params.set('all', 'true');
    }

    return this.http.get<ApiResponse<Match[]> | Match[]>(this.apiUrl, { params }).pipe(
      map(res => {
        if (Array.isArray(res)) {
          return { data: res, pagination: { count: res.length, total: res.length } };
        }
        return {
          data: res.data || [],
          pagination: res.pagination
        };
      })
    );
  }

  /**
   * Look up a match by ID via dedicated backend endpoint.
   */
  getById(id: string): Observable<Match | null> {
    return this.http.get<ApiResponse<Match>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data || null),
      catchError(err => {
        if (err?.status === 404) return of(null);
        throw err;
      })
    );
  }

  generate(resourceId: string): Observable<Match[]> {
    return this.http.post<ApiResponse<Match[]>>(`${this.apiUrl}/${resourceId}/generate`, {}).pipe(
      map(res => res.data || [])
    );
  }

  accept(id: string): Observable<AcceptMatchResponse> {
    return this.http.put<ApiResponse<AcceptMatchResponse>>(`${this.apiUrl}/${id}/accept`, {}).pipe(
      map(res => res.data)
    );
  }

  reject(id: string): Observable<Match> {
    return this.http.put<ApiResponse<Match>>(`${this.apiUrl}/${id}/reject`, {}).pipe(
      map(res => res.data)
    );
  }
}