import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Request,
  RequestPayload,
  RequestStatus,
  RequestUrgency
} from '../../../core/models/request.model';
import { Category } from '../../../core/models/category.model';
import { ApiResponse } from '../../../core/models/api-error.model';

export type RequestLifecycleAction =
  | 'publish'
  | 'cancel'
  | 'match'
  | 'accept'
  | 'reject'
  | 'release'
  | 'complete'
  | 'expire';

@Injectable({
  providedIn: 'root'
})
export class RequestApiService {
  private http = inject(HttpClient);
  private apiUrl = '/api/requests';

  /**
   * Fetch paginated list of requests with filters.
   * NOTE: Backend GET /api/requests filters by status, categoryId, and city.
   * Urgency filter is passed if provided, but backend controller does not currently
   * index or filter on urgency (CROSS-ENGINEER CONTRACT GAP).
   */
  getAll(
    page = 1,
    limit = 20,
    status?: RequestStatus | string,
    categoryId?: string,
    city?: string,
    urgency?: RequestUrgency | string
  ): Observable<ApiResponse<Request[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    if (city) {
      params = params.set('city', city);
    }
    if (urgency) {
      params = params.set('urgency', urgency);
    }

    return this.http.get<ApiResponse<Request[]>>(this.apiUrl, { params }).pipe(
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

  getById(id: string): Observable<Request> {
    return this.http.get<ApiResponse<Request>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  create(data: RequestPayload): Observable<Request> {
    return this.http.post<ApiResponse<Request>>(this.apiUrl, data).pipe(
      map(res => res.data)
    );
  }

  update(id: string, data: Partial<RequestPayload>): Observable<Request> {
    return this.http.put<ApiResponse<Request>>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.data)
    );
  }

  changeStatus(id: string, action: RequestLifecycleAction): Observable<Request> {
    return this.http.put<ApiResponse<Request>>(`${this.apiUrl}/${id}/status`, { action }).pipe(
      map(res => res.data)
    );
  }

  delete(id: string): Observable<ApiResponse<Request>> {
    return this.http.delete<ApiResponse<Request>>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>('/api/categories').pipe(
      map(res => res.data || [])
    );
  }
}