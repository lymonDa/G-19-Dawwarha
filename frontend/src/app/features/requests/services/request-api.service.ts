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
import { ApiResponse } from '../../../core/models/api-error.model';

@Injectable({
  providedIn: 'root'
})
export class RequestApiService {
  private http = inject(HttpClient);
  private apiUrl = '/api/requests';

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

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => {
        // Backend returns { success: true, data: [...], pagination: {...} }
        if (res && res.data && Array.isArray(res.data)) {
          return res;
        }
        if (Array.isArray(res)) {
          return { success: true, data: res, pagination: { page, limit, count: res.length } };
        }
        return { success: true, data: res?.items || res?.requests || [], pagination: res?.pagination };
      })
    );
  }

  getById(id: string): Observable<Request> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res?.data || res)
    );
  }

  create(data: RequestPayload): Observable<Request> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(res => res?.data || res)
    );
  }

  update(id: string, data: Partial<RequestPayload>): Observable<Request> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res?.data || res)
    );
  }

  changeStatus(id: string, action: 'publish' | 'cancel'): Observable<Request> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { action }).pipe(
      map(res => res?.data || res)
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<any> {
    return this.http.get<any>('/api/categories').pipe(
      map(res => res?.data || res)
    );
  }
}