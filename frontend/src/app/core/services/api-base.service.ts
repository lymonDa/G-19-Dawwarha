import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type QueryParamValue = string | number | boolean | readonly (string | number | boolean)[] | undefined | null;

@Injectable({
  providedIn: 'root'
})
export class ApiBaseService {
  protected http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl || 'http://localhost:5000/api';

  get<T>(path: string, params?: Record<string, QueryParamValue>): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams });
  }

  post<T, B = unknown>(path: string, body?: B): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  put<T, B = unknown>(path: string, body?: B): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }

  private buildParams(params?: Record<string, QueryParamValue>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
