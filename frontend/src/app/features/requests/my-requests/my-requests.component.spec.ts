import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MyRequestsComponent } from './my-requests.component';
import { RequestApiService } from '../services/request-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Request } from '../../../core/models/request.model';

describe('MyRequestsComponent', () => {
  let component: MyRequestsComponent;
  let fixture: ComponentFixture<MyRequestsComponent>;
  let mockApi: { getAll: ReturnType<typeof vi.fn> };
  let mockCurrentUser: ReturnType<typeof signal<any>>;
  let router: Router;

  const mockRequests: Request[] = [
    {
      _id: 'req1',
      title: 'Wheelchair Needed',
      description: 'Urgent need for manual wheelchair',
      categoryId: 'cat1',
      category: { _id: 'cat1', name: 'Medical Equipment' } as any,
      quantity: 1,
      urgency: 'high',
      status: 'published',
      location: { city: 'Cairo' },
      requesterId: 'user123',
      createdAt: new Date().toISOString()
    } as any,
    {
      _id: 'req2',
      title: 'Blood Pressure Monitor',
      description: 'Digital monitor',
      categoryId: 'cat1',
      quantity: 2,
      urgency: 'medium',
      status: 'matched',
      location: { city: 'Cairo' },
      requesterId: { _id: 'user123', name: 'Test User' } as any,
      createdAt: new Date().toISOString()
    } as any,
    {
      _id: 'req3',
      title: 'Crutches',
      description: 'Aluminum crutches',
      categoryId: 'cat1',
      quantity: 1,
      urgency: 'low',
      status: 'published',
      location: { city: 'Giza' },
      requesterId: 'other-user',
      createdAt: new Date().toISOString()
    } as any
  ];

  beforeEach(async () => {
    mockApi = {
      getAll: vi.fn().mockReturnValue(of({ success: true, data: mockRequests }))
    };

    mockCurrentUser = signal({ _id: 'user123', name: 'Test Requester' });

    await TestBed.configureTestingModule({
      imports: [MyRequestsComponent],
      providers: [
        { provide: RequestApiService, useValue: mockApi },
        { provide: AuthService, useValue: { currentUser: mockCurrentUser } },
        provideRouter([])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MyRequestsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load my requests on init and filter by current user ID', () => {
    fixture.detectChanges();
    expect(mockApi.getAll).toHaveBeenCalledWith(1, 100);
    // Should filter out req3 which belongs to 'other-user'
    expect(component.allRequests.length).toBe(2);
    expect(component.allRequests.map(r => r._id)).toEqual(['req1', 'req2']);
    expect(component.filteredRequests.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should fallback to showing all returned requests if current user has no ID', () => {
    mockCurrentUser.set(null);
    fixture.detectChanges();
    expect(component.allRequests.length).toBe(3);
    expect(component.filteredRequests.length).toBe(3);
  });

  it('should switch status tabs and filter requests', () => {
    fixture.detectChanges();
    expect(component.activeTab).toBe('all');
    expect(component.filteredRequests.length).toBe(2);

    component.setTab('matched');
    expect(component.activeTab).toBe('matched');
    expect(component.filteredRequests.length).toBe(1);
    expect(component.filteredRequests[0]._id).toBe('req2');

    component.setTab('draft');
    expect(component.activeTab).toBe('draft');
    expect(component.filteredRequests.length).toBe(0);
  });

  it('should correctly count items per tab', () => {
    fixture.detectChanges();
    expect(component.getCountForTab('all')).toBe(2);
    expect(component.getCountForTab('published')).toBe(1);
    expect(component.getCountForTab('matched')).toBe(1);
    expect(component.getCountForTab('draft')).toBe(0);
  });

  it('should render loading skeleton while loading is true', () => {
    const pending$ = new Subject<any>();
    mockApi.getAll.mockReturnValue(pending$);
    const newFixture = TestBed.createComponent(MyRequestsComponent);
    newFixture.detectChanges();

    const skeletons = newFixture.nativeElement.querySelectorAll('app-skeleton');
    expect(skeletons.length).toBe(3);
  });

  it('should display empty state when no requests match the active tab', () => {
    fixture.detectChanges();
    component.setTab('draft');
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('app-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should handle API error gracefully and allow retry', () => {
    mockApi.getAll.mockReturnValueOnce(throwError(() => ({ error: { message: 'Network timeout' } })));
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Network timeout');

    // Test retry
    mockApi.getAll.mockReturnValueOnce(of({ success: true, data: mockRequests }));
    component.loadMyRequests();
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.allRequests.length).toBe(2);
  });

  it('should navigate to /requests/create on navigateToCreate', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any);
    component.navigateToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/requests/create']);
  });
});
