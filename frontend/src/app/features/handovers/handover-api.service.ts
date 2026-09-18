import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { ApiBaseService } from '../../core/services/api-base.service';
import { Handover, HandoverConfirmResponse, HandoverStatus } from '../../core/models/handover.model';

export interface HandoverApiError {
  statusCode: number;
  code: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class HandoverApiService {
  private api = inject(ApiBaseService);

  // In-memory fallback/cache for seamless offline testing & demo persistence
  private localHandoverStore = new Map<string, Handover>();

  /**
   * Confirms the handover for the given matchId.
   *
   * CRITICAL ARCHITECTURAL CONSTRAINTS:
   * 1. Keyed by matchId, NOT handoverId.
   * 2. The request body NEVER contains a `side` field — side is derived strictly
   *    server-side from the authenticated JWT user.
   * 3. The endpoint is idempotent per side — duplicate confirmations return 200 without error.
   */
  confirmHandover(matchId: string): Observable<HandoverConfirmResponse> {
    // Under NO circumstances send 'side' in the request payload.
    // The backend intentionally derives identity from req.user._id (Backend Plan §11 / Task 4.A).
    const payload = {};

    return this.api.post<{ success: boolean; data: HandoverConfirmResponse }>(
      `/transactions/${matchId}/confirm`,
      payload
    ).pipe(
      map(response => {
        const data = response?.data || {
          status: 'in_progress',
          bothConfirmed: false
        };

        // Synchronize local cache if present
        const cached = this.localHandoverStore.get(matchId);
        if (cached) {
          cached.status = data.status;
          if (data.bothConfirmed) {
            cached.confirmedByProvider = true;
            cached.confirmedBySeeker = true;
            cached.completedAt = cached.completedAt || new Date().toISOString();
          }
          this.localHandoverStore.set(matchId, cached);
        }

        return data;
      }),
      catchError(err => {
        const statusCode = err?.status || 500;
        const errBody = err?.error?.error || err?.error || {};
        const code = errBody.code || (statusCode === 403 ? 'FORBIDDEN' : statusCode === 409 ? 'HANDOVER_INACTIVE' : 'REQUEST_ERROR');
        const message = errBody.message || err?.message || 'An error occurred while confirming handover.';

        const parsedError: HandoverApiError = {
          statusCode,
          code,
          message
        };
        return throwError(() => parsedError);
      })
    );
  }

  /**
   * Retrieves handover state for a matchId from the backend.
   * GET /api/transactions/:matchId — requires authenticated participant.
   */
  getHandover(matchId: string): Observable<Handover> {
    // Check local cache first for immediate display
    if (this.localHandoverStore.has(matchId)) {
      return of(this.localHandoverStore.get(matchId)!);
    }

    return this.api.get<{ success: boolean; data: Handover }>(`/transactions/${matchId}`).pipe(
      map(res => {
        if (res?.data) {
          this.localHandoverStore.set(matchId, res.data);
          return res.data;
        }
        throw new Error('Handover not found');
      }),
      catchError(err => {
        const statusCode = err?.status || err?.statusCode || 500;
        const errBody = err?.error?.error || err?.error || {};
        const code = errBody.code || (statusCode === 403 ? 'FORBIDDEN' : statusCode === 404 ? 'NOT_FOUND' : 'REQUEST_ERROR');
        const message = errBody.message || err?.message || 'لم يتم العثور على سجل التسليم لهذه المطابقة';

        return throwError(() => ({
          statusCode,
          code,
          message
        } as HandoverApiError));
      })
    );
  }

  /**
   * Manually update cache state (useful for local UI updates after confirmation).
   */
  setHandoverCache(matchId: string, handover: Handover): void {
    this.localHandoverStore.set(matchId, handover);
  }

  /**
   * Clear cache (useful for tests).
   */
  clearCache(): void {
    this.localHandoverStore.clear();
  }
}
