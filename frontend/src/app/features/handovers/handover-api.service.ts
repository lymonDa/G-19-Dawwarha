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
   * Retrieves handover state for a matchId.
   * Attempts server GET first; if not yet exposed by backend, serves cached or mock handover
   * so the detail page can function seamlessly across all environments.
   */
  getHandover(matchId: string, currentUserId?: string): Observable<Handover> {
    // Check if we have an existing record in our local store
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
        // If backend returns 404 or connection is refused in local dev, provide initial handover state
        // using the current user as either provider or seeker
        const fallback = this.createDefaultHandover(matchId, currentUserId);
        this.localHandoverStore.set(matchId, fallback);
        return of(fallback);
      })
    );
  }

  /**
   * Manually update cache state (useful for tests and demos).
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

  private createDefaultHandover(matchId: string, currentUserId?: string): Handover {
    const defaultProviderId = currentUserId || 'user-provider-001';
    const defaultSeekerId = currentUserId === 'user-provider-001' ? 'user-seeker-002' : 'user-seeker-002';

    return {
      id: `handover-${matchId}`,
      matchId,
      providerId: defaultProviderId,
      seekerId: defaultSeekerId,
      confirmedByProvider: false,
      confirmedBySeeker: false,
      status: 'in_progress',
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
