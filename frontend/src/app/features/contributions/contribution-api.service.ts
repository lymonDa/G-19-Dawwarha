import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiBaseService } from '../../core/services/api-base.service';
import { Contribution } from '../../core/models/contribution.model';
import { Pagination } from '../../core/models/pagination.model';

export interface ContributionListResponse {
  contributions: Contribution[];
  pagination: Pagination;
}

@Injectable({
  providedIn: 'root'
})
export class ContributionApiService {
  private api = inject(ApiBaseService);

  /**
   * Retrieves the authenticated user's own contribution history.
   * Endpoint: GET /api/users/me/contributions
   * Privacy guarantee: Contact details are NEVER exposed in this ledger.
   */
  getMyContributions(params?: { page?: number; limit?: number }): Observable<ContributionListResponse> {
    const queryParams: Record<string, any> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;

    return this.api.get<{ success: boolean; data: Contribution[]; pagination: Pagination }>(
      '/users/me/contributions',
      queryParams
    ).pipe(
      map(res => {
        const contributions = (res.data || []).map(item => ({
          ...item,
          id: item.id || (item as any)._id
        }));

        const resPagination = res.pagination;
        const total = resPagination?.total ?? contributions.length;
        const limit = params?.limit || 20;
        const pagination: Pagination = resPagination || {
          total,
          page: params?.page || 1,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        };

        return {
          contributions,
          pagination
        };
      }),
      catchError(err => {
        return throwError(() => ({
          statusCode: err?.status || 500,
          code: err?.error?.error?.code || 'CONTRIBUTION_ERROR',
          message: err?.error?.error?.message || 'تعذر استرجاع سجل المساهمات والأثر المجتمعي'
        }));
      })
    );
  }
}
