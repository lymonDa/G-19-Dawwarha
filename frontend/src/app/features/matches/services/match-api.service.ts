import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Match, MatchStatus } from '../../../core/models/match.model';
import { ApiResponse } from '../../../core/models/api-error.model';

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

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => {
        if (res && res.data && Array.isArray(res.data)) {
          return res;
        }
        if (Array.isArray(res)) {
          return { success: true, data: res, pagination: { page, limit, count: res.length } };
        }
        return { success: true, data: res?.items || res?.matches || [], pagination: res?.pagination };
      })
    );
  }

  getById(id: string): Observable<Match | null> {
    return this.getAll().pipe(
      map(res => {
        const matches = res.data || [];
        return matches.find((m: Match) => (m._id || m.id) === id) || null;
      })
    );
  }

  generate(resourceId: string): Observable<Match[]> {
    return this.http.post<any>(`${this.apiUrl}/${resourceId}/generate`, {}).pipe(
      map(res => res?.data || res)
    );
  }

  accept(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/accept`, {}).pipe(
      map(res => res?.data || res)
    );
  }

  reject(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/reject`, {}).pipe(
      map(res => res?.data || res)
    );
  }
}