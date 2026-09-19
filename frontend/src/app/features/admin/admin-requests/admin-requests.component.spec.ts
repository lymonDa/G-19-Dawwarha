import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AdminRequestsComponent } from './admin-requests.component';
import { RequestApiService } from '../../requests/services/request-api.service';
import { of, throwError } from 'rxjs';
import { Request } from '../../../core/models/request.model';

describe('AdminRequestsComponent', () => {
  let component: AdminRequestsComponent;
  let mockRequestApi: any;

  const mockRequests: Request[] = [
    {
      id: 'req-1',
      requesterId: 'user-1',
      categoryId: { id: 'cat-1', name: 'Medical Devices' } as any,
      quantity: 1,
      urgency: 'high',
      location: { city: 'Cairo', area: 'Maadi' },
      status: 'published',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z'
    },
    {
      id: 'req-2',
      requesterId: 'user-2',
      categoryId: { id: 'cat-2', name: 'Educational Supplies' } as any,
      quantity: 5,
      urgency: 'medium',
      location: { city: 'Giza', area: 'Dokki' },
      status: 'matched',
      createdAt: '2026-03-02T00:00:00Z',
      updatedAt: '2026-03-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    mockRequestApi = {
      getAll: vi.fn().mockReturnValue(of({ success: true, data: mockRequests }))
    };

    TestBed.configureTestingModule({
      providers: [
        AdminRequestsComponent,
        { provide: RequestApiService, useValue: mockRequestApi }
      ]
    });

    component = TestBed.inject(AdminRequestsComponent);
  });

  it('should load live demand requests on init', () => {
    component.ngOnInit();
    expect(mockRequestApi.getAll).toHaveBeenCalledWith(1, 50);
    expect(component.requests().length).toBe(2);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('should handle API error gracefully', () => {
    mockRequestApi.getAll.mockReturnValue(throwError(() => ({ error: { message: 'Server error' } })));
    component.fetchRequests();

    expect(component.requests().length).toBe(0);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Server error');
  });

  it('should return appropriate badge variants for urgency and status', () => {
    expect(component.getUrgencyVariant('high')).toBe('danger');
    expect(component.getUrgencyVariant('medium')).toBe('warning');
    expect(component.getUrgencyVariant('low')).toBe('info');

    expect(component.getStatusVariant('active')).toBe('success');
    expect(component.getStatusVariant('matched')).toBe('warning');
    expect(component.getStatusVariant('cancelled')).toBe('neutral');
  });
});
