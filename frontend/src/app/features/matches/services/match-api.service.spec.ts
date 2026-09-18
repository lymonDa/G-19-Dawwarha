import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
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

  it('should send GET /api/matches with status filter', () => {
    service.getAll('proposed').subscribe(res => {
      expect(res.data?.length).toBe(1);
    });

    const req = httpMock.expectOne(request =>
      request.url === '/api/matches' &&
      request.params.get('status') === 'proposed'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [{ _id: 'match1', score: 0.9 }] });
  });

  it('should send POST /api/matches/:resourceId/generate to run matching engine', () => {
    service.generate('res123').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/matches/res123/generate');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: [{ _id: 'm1' }] });
  });

  it('should send PUT /api/matches/:id/accept to accept a match', () => {
    service.accept('match789').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/matches/match789/accept');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { match: { _id: 'match789', status: 'accepted' }, handoverId: 'h1' } });
  });

  it('should send PUT /api/matches/:id/reject to decline a match', () => {
    service.reject('match789').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/matches/match789/reject');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { _id: 'match789', status: 'rejected' } });
  });
});
