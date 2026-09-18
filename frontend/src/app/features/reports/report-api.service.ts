import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { ApiBaseService } from '../../core/services/api-base.service';
import { CreateReportPayload, Report } from '../../core/models/report.model';
import { Pagination } from '../../core/models/pagination.model';

export interface ReportApiError {
  statusCode: number;
  code: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportApiService {
  private api = inject(ApiBaseService);

  // In-memory cache for reports created by the current user in this session
  // (necessary because the backend does not expose a user-scoped GET /api/reports/me endpoint)
  private userCreatedReports: Report[] = [];

  /**
   * Submits a polymorphic report against a Resource, Request, or User.
   * Endpoint: POST /api/reports
   */
  createReport(payload: CreateReportPayload): Observable<Report> {
    // 1. Client-side target validation
    if (!payload.targetId || !payload.targetType) {
      return throwError(() => ({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'يجب تحديد الكيان ونوع البلاغ بشكل صحيح'
      }));
    }

    const validMongoId = /^[0-9a-fA-F]{24}$/;
    if (!validMongoId.test(payload.targetId)) {
      return throwError(() => ({
        statusCode: 400,
        code: 'INVALID_ID',
        message: 'معرف الكيان المبلغ عنه غير صالح'
      }));
    }

    const allowedReasons = ['spam', 'fraud', 'inappropriate', 'safety', 'other'];
    if (!allowedReasons.includes(payload.reason)) {
      return throwError(() => ({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'سبب البلاغ غير صالح'
      }));
    }

    const body = {
      targetType: payload.targetType,
      targetId: payload.targetId,
      reason: payload.reason,
      description: payload.description || undefined
    };

    return this.api.post<{ success: boolean; data: Report }>('/reports', body).pipe(
      map(res => {
        const report = res.data;
        const normalized: Report = {
          ...report,
          id: report.id || (report as any)._id
        };
        this.userCreatedReports.unshift(normalized);
        return normalized;
      }),
      catchError(err => {
        const statusCode = err?.status || 500;
        const errBody = err?.error?.error || err?.error || {};
        const code = errBody.code || (statusCode === 400 ? 'VALIDATION_ERROR' : statusCode === 403 ? 'FORBIDDEN' : 'REPORT_ERROR');
        const message = errBody.message || err?.message || 'تعذر إرسال البلاغ';

        const parsedError: ReportApiError = {
          statusCode,
          code,
          message
        };
        return throwError(() => parsedError);
      })
    );
  }

  /**
   * Retrieves reports submitted by the current user in the active session.
   * NOTE (CONTRACT GAP): The backend does NOT expose a GET /api/reports/me endpoint.
   * Regular users calling GET /api/reports receive HTTP 403 because it is protected by requireRole('admin').
   */
  getMyRecentReports(): Observable<Report[]> {
    return of([...this.userCreatedReports]);
  }

  /**
   * Lists all reports (Admin only).
   * Endpoint: GET /api/reports
   */
  listReportsForAdmin(params?: {
    status?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  }): Observable<{ reports: Report[]; pagination: Pagination }> {
    return this.api.get<{ success: boolean; data: Report[]; pagination: Pagination }>(
      '/reports',
      params
    ).pipe(
      map(res => ({
        reports: (res.data || []).map(r => ({ ...r, id: r.id || (r as any)._id })),
        pagination: res.pagination
      })),
      catchError(err => {
        return throwError(() => ({
          statusCode: err?.status || 500,
          code: err?.error?.error?.code || 'FORBIDDEN',
          message: err?.error?.error?.message || 'يتطلب هذا الإجراء صلاحيات إدارة عليا'
        }));
      })
    );
  }
}
