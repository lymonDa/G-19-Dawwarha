import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MatchApiService } from './match-api.service';

describe('MatchApiService', () => {
  let service: MatchApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MatchApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MatchApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET /api/matches with status filter and pagination', () => {
    service.getAll('proposed', 2, 15, true).subscribe(res => {
      expect(res.data?.length).toBe(1);
      expect(res.data![0]._id).toBe('match1');
    });

    const req = httpMock.expectOne(request =>
      request.url === '/api/matches' &&
      request.params.get('status') === 'proposed' &&
      request.params.get('page') === '2' &&
      request.params.get('limit') === '15' &&
      request.params.get('all') === 'true'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [{ _id: 'match1', score: 0.9 }] });
  });

  it('should handle raw array response normalization', () => {
    service.getAll().subscribe(res => {
      expect(res.data?.length).toBe(2);
      expect(res.pagination?.count).toBe(2);
    });

    const req = httpMock.expectOne('/api/matches?page=1&limit=20');
    expect(req.request.method).toBe('GET');
    req.flush([{ _id: 'm1' }, { _id: 'm2' }]);
  });

  it('should fetch match by ID using direct GET /api/matches/:id endpoint', () => {
    service.getById('m2').subscribe(match => {
      expect(match).toBeTruthy();
      expect(match?._id).toBe('m2');
      expect(match?.score).toBe(0.95);
    });

    const req = httpMock.expectOne('/api/matches/m2');
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: { _id: 'm2', score: 0.95 }
    });
  });

  it('should return null when getById encounters 404', () => {
    service.getById('m999').subscribe(match => {
      expect(match).toBeNull();
    });

    const req = httpMock.expectOne('/api/matches/m999');
    expect(req.request.method).toBe('GET');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should send POST /api/matches/:resourceId/generate to run matching engine', () => {
    service.generate('res123').subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0]._id).toBe('m1');
    });

    const req = httpMock.expectOne('/api/matches/res123/generate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ success: true, data: [{ _id: 'm1' }] });
  });

  it('should send PUT /api/matches/:id/accept to accept a match', () => {
    service.accept('match789').subscribe(res => {
      expect(res.match._id).toBe('match789');
      expect(res.handoverId).toBe('h1');
    });

    const req = httpMock.expectOne('/api/matches/match789/accept');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { match: { _id: 'match789', status: 'accepted' }, handoverId: 'h1' } });
  });

  it('should send PUT /api/matches/:id/reject to decline a match', () => {
    service.reject('match789').subscribe(res => {
      expect(res.status).toBe('rejected');
    });

    const req = httpMock.expectOne('/api/matches/match789/reject');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { _id: 'match789', status: 'rejected' } });
  });

  it('should propagate HTTP error when accepting fails', () => {
    service.accept('badId').subscribe({
      next: () => {
        throw new Error('Expected failure');
      },
      error: err => {
        expect(err.status).toBe(409);
      }
    });

    const req = httpMock.expectOne('/api/matches/badId/accept');
    req.flush({ message: 'Conflict' }, { status: 409, statusText: 'Conflict' });
  });
});
