import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ResourceApiService, CreateResourcePayload, UpdateResourcePayload } from './resource-api.service';
import { Resource } from '../../core/models/resource.model';

describe('ResourceApiService', () => {
  let service: ResourceApiService;
  let httpMock: HttpTestingController;

  const sampleRawResource = {
    _id: 'res123',
    providerId: 'user1',
    providerOrgId: null,
    categoryId: 'cat1',
    title: '5 Study Desks',
    description: 'Good condition desks',
    quantity: 5,
    location: { city: 'Cairo', area: 'Maadi' },
    availabilityWindow: { start: '2026-10-01T00:00:00.000Z', end: '2026-10-15T00:00:00.000Z' },
    status: 'published' as const,
    safetyDisclosure: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourceApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ResourceApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET /api/resources with sanitized query parameters and map response', () => {
    service.list({ categoryId: 'cat1', city: 'Cairo', page: 2, limit: 10 }).subscribe(page => {
      expect(page.items.length).toBe(1);
      expect(page.items[0].id).toBe('res123');
      expect(page.items[0].title).toBe('5 Study Desks');
      expect(page.total).toBe(1);
      expect(page.page).toBe(2);
      expect(page.limit).toBe(10);
    });

    const req = httpMock.expectOne(request =>
      request.url.endsWith('/resources') &&
      request.params.get('categoryId') === 'cat1' &&
      request.params.get('city') === 'Cairo' &&
      request.params.get('page') === '2' &&
      request.params.get('limit') === '10'
    );
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      data: [sampleRawResource],
      pagination: { total: 1, page: 2, limit: 10, totalPages: 1 }
    });
  });

  it('should send GET /api/resources/:id and map single resource', () => {
    service.get('res123').subscribe(res => {
      expect(res.id).toBe('res123');
      expect(res.title).toBe('5 Study Desks');
      expect(res.status).toBe('published');
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/resources/res123'));
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      data: sampleRawResource
    });
  });

  it('should send POST /api/resources with payload and return created resource', () => {
    const payload: CreateResourcePayload = {
      categoryId: 'cat1',
      title: '5 Study Desks',
      description: 'Good condition desks',
      quantity: 5,
      location: { city: 'Cairo', area: 'Maadi' },
      availabilityWindow: { start: '2026-10-01T00:00:00.000Z', end: '2026-10-15T00:00:00.000Z' }
    };

    service.create(payload).subscribe(res => {
      expect(res.id).toBe('res123');
      expect(res.status).toBe('published');
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/resources'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({
      success: true,
      data: sampleRawResource
    });
  });

  it('should send PUT /api/resources/:id with update payload', () => {
    const payload: UpdateResourcePayload = {
      quantity: 10
    };

    service.update('res123', payload).subscribe(res => {
      expect(res.id).toBe('res123');
      expect(res.quantity).toBe(10);
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/resources/res123'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush({
      success: true,
      data: { ...sampleRawResource, quantity: 10 }
    });
  });

  it('should send PUT /api/resources/:id/status for lifecycle state changes', () => {
    service.transitionStatus('res123', 'publish').subscribe(res => {
      expect(res.id).toBe('res123');
      expect(res.status).toBe('published');
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/resources/res123/status'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ action: 'publish' });

    req.flush({
      success: true,
      data: { ...sampleRawResource, status: 'published' }
    });
  });

  it('should send DELETE /api/resources/:id for soft cancellation', () => {
    service.cancel('res123').subscribe(res => {
      expect(res.id).toBe('res123');
      expect(res.status).toBe('cancelled');
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/resources/res123'));
    expect(req.request.method).toBe('DELETE');

    req.flush({
      success: true,
      message: 'Resource cancelled successfully',
      data: { ...sampleRawResource, status: 'cancelled' }
    });
  });

  it('should filter resources by providerId in listMine helper', () => {
    const otherUserResource = {
      ...sampleRawResource,
      _id: 'res456',
      providerId: 'otherUser'
    };

    service.listMine('user1').subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('res123');
      expect(items[0].providerId).toBe('user1');
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/resources') && request.params.get('limit') === '100');
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      data: [sampleRawResource, otherUserResource],
      pagination: { total: 2, page: 1, limit: 100, totalPages: 1 }
    });
  });

  it('should propagate HTTP errors cleanly', () => {
    service.get('res999').subscribe({
      next: () => expect.fail('Should have failed'),
      error: (err) => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/resources/res999'));
    req.flush({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found.' } }, { status: 404, statusText: 'Not Found' });
  });
});
