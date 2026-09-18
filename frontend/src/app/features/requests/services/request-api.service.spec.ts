import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RequestApiService } from './request-api.service';

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

  it('should send GET /api/requests with correct query parameters', () => {
    service.getAll(1, 10, 'published', 'cat123', 'Cairo', 'high').subscribe(res => {
      expect(res.data?.length).toBe(1);
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

  it('should send POST /api/requests when creating', () => {
    const payload: any = { categoryId: 'cat1', quantity: 2, urgency: 'medium', location: { city: 'Cairo' } };
    service.create(payload).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/requests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: { _id: 'req1', ...payload } });
  });

  it('should send PUT /api/requests/:id/status for lifecycle action', () => {
    service.changeStatus('req123', 'publish').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/requests/req123/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ action: 'publish' });
    req.flush({ success: true, data: { _id: 'req123', status: 'published' } });
  });
});
