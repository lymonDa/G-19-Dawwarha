import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiBaseService } from '../../core/services/api-base.service';
import { User } from '../../core/models/user.model';
import { Organization } from '../../core/models/organization.model';
import { Paginated } from '../../core/models/pagination.model';

export interface VerifyOrganizationPayload {
  decision: 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private api = inject(ApiBaseService);

  /**
   * Retrieves paginated users list.
   * Endpoint: GET /api/admin/users
   */
  getUsers(params: ListUsersParams = {}): Observable<Paginated<User>> {
    const queryParams: Record<string, any> = {};
    if (params.page) queryParams['page'] = params.page;
    if (params.limit) queryParams['limit'] = params.limit;
    if (params.role) queryParams['role'] = params.role;
    if (params.search) queryParams['search'] = params.search;

    return this.api.get<{ success: boolean; data: any[]; pagination?: any; total?: number; totalPages?: number }>(
      '/admin/users',
      queryParams
    ).pipe(
      map(res => {
        const raw = res.data || [];
        const items: User[] = raw.map(u => this.normalizeUser(u));
        const total = res.pagination?.total ?? res.total ?? items.length;
        const totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.max(1, Math.ceil(total / (params.limit || 10)));
        const page = res.pagination?.page ?? params.page ?? 1;
        const limit = res.pagination?.limit ?? params.limit ?? 10;

        return {
          data: items,
          total,
          totalPages,
          page,
          limit
        };
      }),
      catchError(err => throwError(() => this.formatError(err, 'Failed to fetch users list')))
    );
  }

  /**
   * Suspends a user account.
   * Endpoint: PUT /api/admin/users/:id/suspend
   */
  suspendUser(userId: string): Observable<User> {
    return this.api.put<{ success: boolean; data: any }>(`/admin/users/${userId}/suspend`, {}).pipe(
      map(res => this.normalizeUser(res.data)),
      catchError(err => throwError(() => this.formatError(err, 'Failed to suspend user')))
    );
  }

  /**
   * Reactivates a suspended user account.
   * Endpoint: PUT /api/admin/users/:id/reactivate
   */
  reactivateUser(userId: string): Observable<User> {
    return this.api.put<{ success: boolean; data: any }>(`/admin/users/${userId}/reactivate`, {}).pipe(
      map(res => this.normalizeUser(res.data)),
      catchError(err => throwError(() => this.formatError(err, 'Failed to reactivate user')))
    );
  }

  /**
   * Retrieves organizations list for admin review.
   * Endpoint: GET /api/organizations
   */
  getOrganizations(params: Record<string, any> = {}): Observable<Organization[]> {
    return this.api.get<{ success: boolean; data: any[] }>('/organizations', params).pipe(
      map(res => {
        const raw = res.data || [];
        return raw.map(org => this.normalizeOrganization(org));
      }),
      catchError(err => throwError(() => this.formatError(err, 'Failed to fetch organizations list')))
    );
  }

  /**
   * Submits verification decision for an organization.
   * Endpoint: POST /api/organizations/:id/verify
   */
  verifyOrganization(orgId: string, payload: VerifyOrganizationPayload): Observable<Organization> {
    const body: Record<string, string> = { decision: payload.decision };
    if (payload.decision === 'rejected' && payload.rejectionReason) {
      body['rejectionReason'] = payload.rejectionReason.trim();
    }

    return this.api.post<{ success: boolean; data: any }>(`/organizations/${orgId}/verify`, body).pipe(
      map(res => this.normalizeOrganization(res.data)),
      catchError(err => throwError(() => this.formatError(err, 'Failed to update organization verification')))
    );
  }

  private normalizeUser(u: any): User {
    return {
      id: u._id || u.id,
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'user',
      status: u.status || 'active',
      phone: u.contactInfo?.phone || u.phone,
      location: u.location,
      organizationId: u.organizationId,
      stats: u.stats,
      createdAt: u.createdAt || new Date().toISOString(),
      updatedAt: u.updatedAt
    };
  }

  private normalizeOrganization(org: any): Organization {
    const rawStatus = org.verification?.status || org.verificationStatus || 'unverified';
    const verificationStatus = rawStatus === 'approved' ? 'verified' : rawStatus;

    return {
      id: org._id || org.id,
      name: org.name || '',
      type: org.type || 'ngo',
      description: org.description || '',
      verificationStatus,
      verificationNotes: org.verification?.rejectionReason || org.verificationNotes,
      ownerUserId: org.ownerUserId,
      contact: {
        email: org.contactInfo?.email || org.contact?.email || '',
        phone: org.contactInfo?.phone || org.contact?.phone || '',
        address: org.contactInfo?.address?.street || org.contact?.address || '',
        city: org.contactInfo?.address?.city || org.contact?.city || ''
      },
      documents: (org.verification?.submittedDocuments || org.documents || []).map((doc: any, idx: number) => {
        if (typeof doc === 'string') {
          return {
            name: `Official Document #${idx + 1}`,
            url: doc,
            uploadedAt: org.updatedAt || org.createdAt || new Date().toISOString()
          };
        }
        return doc;
      }),
      stats: org.stats,
      createdAt: org.createdAt || new Date().toISOString(),
      updatedAt: org.updatedAt
    };
  }

  private formatError(err: any, fallbackMsg: string): { message: string; statusCode: number; code?: string } {
    return {
      message: err?.error?.error?.message || err?.message || fallbackMsg,
      statusCode: err?.status || 500,
      code: err?.error?.error?.code
    };
  }
}
