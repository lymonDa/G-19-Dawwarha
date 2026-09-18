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
   * Retrieves persistent reports submitted by the authenticated user.
   * Endpoint: GET /api/reports/me
   */
  getMyReports(params?: { page?: number; limit?: number }): Observable<{ reports: Report[]; pagination: Pagination }> {
    const queryParams: Record<string, any> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;

    return this.api.get<{
      success: boolean;
      data: Report[];
      pagination: Pagination;
    }>('/reports/me', queryParams).pipe(
      map(res => {
        const rawReports = res.data || [];
        const reports: Report[] = rawReports.map(r => ({
          ...r,
          id: r.id || (r as any)._id
        }));

        const pagination: Pagination = res.pagination || {
          total: reports.length,
          page: params?.page || 1,
          limit: params?.limit || 20,
          totalPages: Math.ceil(reports.length / (params?.limit || 20)) || 1
        };

        return { reports, pagination };
      }),
      catchError(err => {
        const statusCode = err?.status || 500;
        const errBody = err?.error?.error || err?.error || {};
        const code = errBody.code || 'REPORTS_FETCH_ERROR';
        const message = errBody.message || err?.message || 'تعذر استرجاع سجل البلاغات من الخادم';

        return throwError(() => ({
          statusCode,
          code,
          message
        }));
      })
    );
  }

  /**
   * Retrieves reports submitted by the current user from backend source of truth.
   */
  getMyRecentReports(): Observable<Report[]> {
    return this.getMyReports().pipe(
      map(res => res.reports)
    );
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
