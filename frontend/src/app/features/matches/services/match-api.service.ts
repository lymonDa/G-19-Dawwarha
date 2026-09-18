import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Match, MatchStatus } from '../../../core/models/match.model';
import { ApiResponse } from '../../../core/models/api-error.model';

export interface AcceptMatchResponse {
  match: Match;
  handoverId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatchApiService {
  private http = inject(HttpClient);
  private apiUrl = '/api/matches';

  getAll(
    status?: MatchStatus | string,
    page = 1,
    limit = 20,
    all = false
  ): Observable<ApiResponse<Match[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (all) {
      params = params.set('all', 'true');
    }

    return this.http.get<ApiResponse<Match[]>>(this.apiUrl, { params }).pipe(
      map(res => {
        if (res && res.data && Array.isArray(res.data)) {
          return res;
        }
        return {
          success: true,
          data: Array.isArray(res) ? res : [],
          pagination: { page, limit, count: Array.isArray(res) ? res.length : 0 }
        };
      })
    );
  }

  /**
   * Look up a match by ID.
   * CROSS-ENGINEER CONTRACT GAP:
   * Backend /api/matches routes only expose GET /, POST /:resourceId/generate,
   * PUT /:id/accept, and PUT /:id/reject. There is no backend GET /api/matches/:id.
   * Frontend fetches matches with higher limit as a deterministic fallback.
   */
  getById(id: string): Observable<Match | null> {
    return this.getAll(undefined, 1, 100, true).pipe(
      map(res => {
        const matches = res.data || [];
        return matches.find((m: Match) => (m._id || m.id) === id) || null;
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