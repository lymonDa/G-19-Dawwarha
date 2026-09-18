import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiBaseService } from '../../core/services/api-base.service';
import { Resource, ResourceStatus, ResourceFilters, ResourceLifecycleAction } from '../../core/models/resource.model';

interface ResourceApiResponse {
  _id: string;
  providerId: string;
  providerOrgId: string | null;
  categoryId: string;
  title: string;
  description: string;
  quantity: number;
  location: { city: string; area?: string };
  availabilityWindow: { start: string; end: string };
  status: ResourceStatus;
  safetyDisclosure: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ResourcesListResponse {
  success: boolean;
  data: ResourceApiResponse[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface ResourcesPage {
  items: Resource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ResourceDetailResponse {
  success: boolean;
  data: ResourceApiResponse;
}

export interface CreateResourcePayload {
  categoryId: string;
  title: string;
  description: string;
  quantity: number;
  location: { city: string; area?: string };
  availabilityWindow: { start: string; end: string };
  safetyDisclosure?: string;
  providerOrgId?: string;
}

export type UpdateResourcePayload = Partial<Omit<CreateResourcePayload, 'providerOrgId'>>;

@Injectable({
  providedIn: 'root'
})
export class ResourceApiService {

  private api = inject(ApiBaseService);

  list(filters: ResourceFilters = {}): Observable<ResourcesPage> {
    return this.api.get<ResourcesListResponse>('/resources', filters as Record<string, any>).pipe(
      map(response => ({
        items: response.data.map(raw => this.toResource(raw)),
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.totalPages
      }))
    );
  }

  get(id: string): Observable<Resource> {
    return this.api.get<ResourceDetailResponse>(`/resources/${id}`).pipe(
      map(response => this.toResource(response.data))
    );
  }

  create(payload: CreateResourcePayload): Observable<Resource> {
    return this.api.post<ResourceDetailResponse>('/resources', payload).pipe(
      map(response => this.toResource(response.data))
    );
  }

  update(id: string, payload: UpdateResourcePayload): Observable<Resource> {
    return this.api.put<ResourceDetailResponse>(`/resources/${id}`, payload).pipe(
      map(response => this.toResource(response.data))
    );
  }

  /**
   * The ONE place a resource's status changes. Never send a raw { status } via update().
   */
  transitionStatus(id: string, action: ResourceLifecycleAction): Observable<Resource> {
    return this.api.put<ResourceDetailResponse>(`/resources/${id}/status`, { action }).pipe(
      map(response => this.toResource(response.data))
    );
  }

  /** Soft cancellation (backend transitions to 'cancelled'), never a hard delete. */
  cancel(id: string): Observable<Resource> {
    return this.api.delete<ResourceDetailResponse>(`/resources/${id}`).pipe(
      map(response => this.toResource(response.data))
    );
  }

  private toResource(raw: ResourceApiResponse): Resource {
    return {
      id: raw._id,
      title: raw.title,
      categoryId: raw.categoryId,
      quantity: raw.quantity,
      description: raw.description,
      location: raw.location,
      availabilityWindow: raw.availabilityWindow,
      status: raw.status,
      providerId: raw.providerId,
      providerOrgId: raw.providerOrgId ?? undefined,
      safetyDisclosure: raw.safetyDisclosure ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }
}