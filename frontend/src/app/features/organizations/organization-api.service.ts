import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiBaseService } from '../../core/services/api-base.service';
import { Organization } from '../../core/models/organization.model';

export interface OrgVerificationSubmissionPayload {
  submittedDocuments: string[];
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationApiService {
  private api = inject(ApiBaseService);

  /**
   * Retrieves current user's organization.
   * Endpoint: GET /api/organizations/mine
   */
  getMyOrganization(): Observable<Organization> {
    return this.api.get<{ success: boolean; data: any }>('/organizations/mine').pipe(
      map(res => this.normalizeOrganization(res.data)),
      catchError(err => {
        return throwError(() => ({
          statusCode: err?.status || 500,
          code: err?.error?.error?.code || 'NOT_FOUND',
          message: err?.error?.error?.message || 'تعذر العثور على بيانات المنظمة'
        }));
      })
    );
  }

  /**
   * Registers a new civil organization.
   * Endpoint: POST /api/organizations
   */
  registerOrganization(payload: any): Observable<Organization> {
    return this.api.post<{ success: boolean; data: any }>('/organizations', payload).pipe(
      map(res => this.normalizeOrganization(res.data)),
      catchError(err => {
        return throwError(() => ({
          statusCode: err?.status || 500,
          code: err?.error?.error?.code || 'REGISTRATION_ERROR',
          message: err?.error?.error?.message || 'Could not complete organization registration.'
        }));
      })
    );
  }

  /**
   * Retrieves organization details by ID.
   * Endpoint: GET /api/organizations/:id
   */
  getOrganizationById(id: string): Observable<Organization> {
    return this.api.get<{ success: boolean; data: any }>(`/organizations/${id}`).pipe(
      map(res => this.normalizeOrganization(res.data)),
      catchError(err => {
        return throwError(() => ({
          statusCode: err?.status || 500,
          code: err?.error?.error?.code || 'NOT_FOUND',
          message: err?.error?.error?.message || 'تعذر العثور على بيانات المنظمة'
        }));
      })
    );
  }

  /**
   * Submits or updates verification documents for an organization.
   * Endpoint: PUT /api/organizations/:id
   * Payload: { submittedDocuments: string[] }
   */
  submitVerificationDocuments(id: string, documents: string[]): Observable<Organization> {
    const body = {
      submittedDocuments: documents
    };

    return this.api.put<{ success: boolean; data: any }>(`/organizations/${id}`, body).pipe(
      map(res => this.normalizeOrganization(res.data)),
      catchError(err => {
        return throwError(() => ({
          statusCode: err?.status || 500,
          code: err?.error?.error?.code || 'VERIFICATION_SUBMISSION_ERROR',
          message: err?.error?.error?.message || 'تعذر رفع وثائق التوثيق الرسمية'
        }));
      })
    );
  }

  private normalizeOrganization(raw: any): Organization {
    const rawStatus = raw?.verification?.status || raw?.verificationStatus || 'unverified';
    // Map backend 'approved' to frontend 'verified'
    const verificationStatus = rawStatus === 'approved' ? 'verified' : rawStatus;

    return {
      id: raw?._id || raw?.id,
      name: raw?.name || '',
      type: raw?.type || 'ngo',
      description: raw?.description || '',
      verificationStatus,
      verificationNotes: raw?.verification?.rejectionReason || raw?.verificationNotes,
      ownerUserId: raw?.ownerUserId,
      contact: {
        email: raw?.contactInfo?.email || '',
        phone: raw?.contactInfo?.phone || '',
        address: raw?.contactInfo?.address?.street || '',
        city: raw?.contactInfo?.address?.city || ''
      },
      documents: (raw?.verification?.submittedDocuments || []).map((docUrl: string, idx: number) => ({
        name: `وثيقة رسمية #${idx + 1}`,
        url: docUrl,
        uploadedAt: raw?.updatedAt || raw?.createdAt || new Date().toISOString()
      })),
      createdAt: raw?.createdAt || new Date().toISOString(),
      updatedAt: raw?.updatedAt
    };
  }
}
