import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { RequestApiService } from './request-api.service';
import { RequestPayload } from '../../../core/models/request.model';

describe('RequestApiService', () => {
  let service: RequestApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RequestApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(RequestApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET /api/requests with all provided filter parameters', () => {
    service.getAll(1, 10, 'published', 'cat123', 'Cairo', 'high').subscribe(res => {
      expect(res.data?.length).toBe(1);
      expect(res.data![0]._id).toBe('1');
    });

    const req = httpMock.expectOne(request =>
      request.url === '/api/requests' &&
      request.params.get('page') === '1' &&
      request.params.get('limit') === '10' &&
      request.params.get('status') === 'published' &&
      request.params.get('categoryId') === 'cat123' &&
      request.params.get('city') === 'Cairo' &&
      request.params.get('urgency') === 'high'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [{ _id: '1', quantity: 5 }] });
  });

  it('should send GET /api/requests with default pagination and handle naked array responses', () => {
    service.getAll().subscribe(res => {
      expect(res.data?.length).toBe(1);
      expect(res.pagination?.count).toBe(1);
    });

    const req = httpMock.expectOne('/api/requests?page=1&limit=20');
    expect(req.request.method).toBe('GET');
    req.flush([{ _id: 'raw1' }]);
  });

  it('should send GET /api/requests/:id for single request lookup', () => {
    service.getById('req99').subscribe(res => {
      expect(res._id).toBe('req99');
    });

    const req = httpMock.expectOne('/api/requests/req99');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { _id: 'req99', title: 'Hospital Beds' } });
  });

  it('should send POST /api/requests when creating', () => {
    const payload: RequestPayload = {
      categoryId: 'cat1',
      quantity: 2,
      urgency: 'medium',
      location: { city: 'Cairo' }
    };

    service.create(payload).subscribe(res => {
      expect(res).toBeTruthy();
      expect(res._id).toBe('req1');
    });

    const req = httpMock.expectOne('/api/requests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: { _id: 'req1', ...payload } });
  });

  it('should send PUT /api/requests/:id when updating', () => {
    const patch: Partial<RequestPayload> = { quantity: 10 };
    service.update('req1', patch).subscribe(res => {
      expect(res.quantity).toBe(10);
    });

    const req = httpMock.expectOne('/api/requests/req1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(patch);
    req.flush({ success: true, data: { _id: 'req1', quantity: 10 } });
  });

  it('should send PUT /api/requests/:id/status for lifecycle action', () => {
    service.changeStatus('req123', 'publish').subscribe(res => {
      expect(res.status).toBe('published');
    });

    const req = httpMock.expectOne('/api/requests/req123/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ action: 'publish' });
    req.flush({ success: true, data: { _id: 'req123', status: 'published' } });
  });

  it('should send DELETE /api/requests/:id', () => {
    service.delete('req123').subscribe(res => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne('/api/requests/req123');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, message: 'Deleted' });
  });

  it('should fetch categories via GET /api/categories', () => {
    service.getCategories().subscribe(categories => {
      expect(categories.length).toBe(1);
      expect(categories[0].name).toBe('Oxygen Supplies');
    });

    const req = httpMock.expectOne('/api/categories');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [{ _id: 'c1', name: 'Oxygen Supplies' }] });
  });

  it('should propagate API error responses', () => {
    service.getById('missing').subscribe({
      next: () => {
        throw new Error('Expected request to fail');
      },
      error: err => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne('/api/requests/missing');
    req.flush({ message: 'Request not found' }, { status: 404, statusText: 'Not Found' });
  });
});
