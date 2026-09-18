import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MatchListComponent } from './match-list.component';
import { MatchApiService } from '../services/match-api.service';
import { ResourceApiService } from '../../resources/resource-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Match } from '../../../core/models/match.model';

describe('MatchListComponent', () => {
  let component: MatchListComponent;
  let fixture: ComponentFixture<MatchListComponent>;
  let mockMatchApi: {
    getAll: ReturnType<typeof vi.fn>;
    generate: ReturnType<typeof vi.fn>;
    accept: ReturnType<typeof vi.fn>;
    reject: ReturnType<typeof vi.fn>;
  };
  let mockResourceApi: {
    list: ReturnType<typeof vi.fn>;
  };
  let mockToast: {
    show: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const mockMatches: Match[] = [
    {
      _id: 'm1',
      resourceId: {
        _id: 'res1',
        title: 'Oxygen Concentrator',
        quantity: 1,
        location: { city: 'Cairo' },
        providerId: 'prov1'
      } as any,
      requestId: {
        _id: 'req1',
        title: 'Need Oxygen Concentrator',
        quantity: 1,
        urgency: 'high',
        location: { city: 'Cairo' },
        requesterId: 'reqUser1'
      } as any,
      status: 'proposed',
      score: 0.95,
      scoreBreakdown: {
        category: 1.0,
        location: 1.0,
        quantity: 0.9,
        urgency: 0.95,
        availability: 0.9
      },
      createdAt: new Date().toISOString()
    } as any
  ];

  const mockResourcesPage = {
    items: [
      { id: 'res1', title: 'Oxygen Concentrator', quantity: 1, location: { city: 'Cairo' }, status: 'available' },
      { id: 'res2', title: 'Wheelchair', quantity: 2, location: { city: 'Giza' }, status: 'available' }
    ],
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1
  };

  beforeEach(async () => {
    mockMatchApi = {
      getAll: vi.fn().mockReturnValue(of({ success: true, data: mockMatches })),
      generate: vi.fn().mockReturnValue(of([mockMatches[0]])),
      accept: vi.fn().mockReturnValue(of({ success: true })),
      reject: vi.fn().mockReturnValue(of({ success: true }))
    };

    mockResourceApi = {
      list: vi.fn().mockReturnValue(of(mockResourcesPage))
    };

    mockToast = {
      show: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MatchListComponent],
      providers: [
        { provide: MatchApiService, useValue: mockMatchApi },
        { provide: ResourceApiService, useValue: mockResourceApi },
        { provide: ToastService, useValue: mockToast },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({ _id: 'prov1', role: 'user' })
          }
        },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'resourceId' ? 'res1' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MatchListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load matches and available resources on initialization and preserve query param resourceId', () => {
    fixture.detectChanges();
    expect(mockMatchApi.getAll).toHaveBeenCalledWith(undefined);
    expect(mockResourceApi.list).toHaveBeenCalledWith({ status: 'available' });
    expect(component.matches.length).toBe(1);
    expect(component.availableResources.length).toBe(2);
    expect(component.generateResourceId).toBe('res1');
  });

  it('should filter matches when status dropdown changes', () => {
    fixture.detectChanges();
    component.selectedStatus = 'accepted';
    component.loadMatches();
    expect(mockMatchApi.getAll).toHaveBeenCalledWith('accepted');
  });

  it('should generate matches for selected resource and display toast message', () => {
    fixture.detectChanges();
    component.generateResourceId = 'res1';
    component.generateMatchesForResource();

    expect(component.generatingMatches).toBe(false);
    expect(mockMatchApi.generate).toHaveBeenCalledWith('res1');
    expect(mockToast.show).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success' })
    );
  });

  it('should call accept API and reload matches on accept', () => {
    fixture.detectChanges();
    component.onAccept(mockMatches[0]);

    expect(mockMatchApi.accept).toHaveBeenCalledWith('m1');
    expect(mockToast.show).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success' })
    );
  });

  it('should handle 409 conflict and 403 unauthorized on accept error', () => {
    fixture.detectChanges();

    mockMatchApi.accept.mockReturnValueOnce(throwError(() => ({ status: 409 })));
    component.onAccept(mockMatches[0]);
    expect(component.errorMessage).toContain('Conflict');
    expect(mockToast.show).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'error' })
    );

    mockMatchApi.accept.mockReturnValueOnce(throwError(() => ({ status: 403 })));
    component.onAccept(mockMatches[0]);
    expect(component.errorMessage).toContain('not authorized');
  });

  it('should call reject API and reload matches on reject', () => {
    fixture.detectChanges();
    component.onReject(mockMatches[0]);

    expect(mockMatchApi.reject).toHaveBeenCalledWith('m1');
    expect(mockToast.show).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'info' })
    );
  });

  it('should render skeleton loaders when loading is true', () => {
    const pending$ = new Subject<any>();
    mockMatchApi.getAll.mockReturnValue(pending$);
    const newFixture = TestBed.createComponent(MatchListComponent);
    newFixture.detectChanges();

    const skeletons = newFixture.nativeElement.querySelectorAll('app-skeleton');
    expect(skeletons.length).toBe(3);
  });

  it('should render empty state when no matches exist', () => {
    mockMatchApi.getAll.mockReturnValue(of({ success: true, data: [] }));
    const newFixture = TestBed.createComponent(MatchListComponent);
    newFixture.detectChanges();

    const emptyState = newFixture.nativeElement.querySelector('app-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should navigate to /requests/create on navigateToCreateRequest', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any);
    component.navigateToCreateRequest();
    expect(navigateSpy).toHaveBeenCalledWith(['/requests/create']);
  });
});
