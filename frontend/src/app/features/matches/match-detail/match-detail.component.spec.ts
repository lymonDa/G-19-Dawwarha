import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MatchDetailComponent } from './match-detail.component';
import { MatchApiService } from '../services/match-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Match } from '../../../core/models/match.model';

describe('MatchDetailComponent', () => {
  let component: MatchDetailComponent;
  let fixture: ComponentFixture<MatchDetailComponent>;
  let mockMatchApi: {
    getById: ReturnType<typeof vi.fn>;
    accept: ReturnType<typeof vi.fn>;
    reject: ReturnType<typeof vi.fn>;
  };
  let mockCurrentUser: ReturnType<typeof signal<any>>;
  let mockToast: { show: ReturnType<typeof vi.fn> };

  const mockMatch: Match = {
    _id: 'match123',
    status: 'proposed',
    score: 0.92,
    scoreBreakdown: {
      category: 1.0,
      location: 0.9,
      quantity: 1.0,
      urgency: 0.9,
      availability: 0.8
    },
    resourceId: {
      _id: 'res1',
      title: 'Ventilator',
      quantity: 1,
      providerId: 'providerUser1',
      location: { city: 'Cairo', area: 'Dokki' },
      categoryId: { _id: 'c1', name: 'Medical' }
    } as any,
    requestId: {
      _id: 'req1',
      title: 'Need Ventilator',
      quantity: 1,
      requesterId: 'requesterUser1',
      urgency: 'high',
      location: { city: 'Cairo', area: 'Dokki' },
      categoryId: { _id: 'c1', name: 'Medical' }
    } as any,
    createdAt: new Date().toISOString()
  } as any;

  beforeEach(async () => {
    mockMatchApi = {
      getById: vi.fn().mockReturnValue(of(mockMatch)),
      accept: vi.fn().mockReturnValue(of({ success: true })),
      reject: vi.fn().mockReturnValue(of({ success: true }))
    };

    mockCurrentUser = signal({ _id: 'providerUser1', role: 'user' });
    mockToast = { show: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MatchDetailComponent],
      providers: [
        { provide: MatchApiService, useValue: mockMatchApi },
        { provide: AuthService, useValue: { currentUser: mockCurrentUser } },
        { provide: ToastService, useValue: mockToast },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'match123' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create and load match details on init', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(mockMatchApi.getById).toHaveBeenCalledWith('match123');
    expect(component.match).toEqual(mockMatch);
    expect(component.resourceTitle).toBe('Ventilator');
    expect(component.requestCategory).toBe('Medical');
    expect(component.requestUrgency).toBe('high');
  });

  it('should authorize the provider party', () => {
    mockCurrentUser.set({ _id: 'providerUser1', role: 'user' });
    fixture.detectChanges();
    expect(component.isAuthorizedParty).toBe(true);
  });

  it('should authorize the requester party', () => {
    mockCurrentUser.set({ _id: 'requesterUser1', role: 'user' });
    fixture.detectChanges();
    expect(component.isAuthorizedParty).toBe(true);
  });

  it('should authorize an admin unconditionally', () => {
    mockCurrentUser.set({ _id: 'adminUser99', role: 'admin' });
    fixture.detectChanges();
    expect(component.isAuthorizedParty).toBe(true);
  });

  it('should deny unauthorized 3rd party viewer', () => {
    mockCurrentUser.set({ _id: 'unrelatedUser', role: 'user' });
    fixture.detectChanges();
    expect(component.isAuthorizedParty).toBe(false);
  });

  it('should handle accept flow via dialog and API', () => {
    fixture.detectChanges();
    component.promptAccept();
    expect(component.showAcceptConfirm).toBe(true);

    component.confirmAccept();
    expect(component.showAcceptConfirm).toBe(false);
    expect(mockMatchApi.accept).toHaveBeenCalledWith('match123');
    expect(component.match?.status).toBe('accepted');
    expect(mockToast.show).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success' })
    );
  });

  it('should handle 409 conflict on accept error', () => {
    fixture.detectChanges();
    mockMatchApi.accept.mockReturnValueOnce(throwError(() => ({ status: 409 })));

    component.confirmAccept();
    expect(component.errorMessage).toContain('Conflict');
    expect(mockToast.show).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'error' })
    );
  });

  it('should handle reject flow via dialog and API', () => {
    fixture.detectChanges();
    component.promptReject();
    expect(component.showRejectConfirm).toBe(true);

    component.confirmReject();
    expect(component.showRejectConfirm).toBe(false);
    expect(mockMatchApi.reject).toHaveBeenCalledWith('match123');
    expect(component.match?.status).toBe('rejected');
    expect(mockToast.show).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'info' })
    );
  });

  it('should render loading skeleton while loading', () => {
    const pending$ = new Subject<any>();
    mockMatchApi.getById.mockReturnValue(pending$);
    const newFixture = TestBed.createComponent(MatchDetailComponent);
    newFixture.detectChanges();

    const skeletons = newFixture.nativeElement.querySelectorAll('app-skeleton');
    expect(skeletons.length).toBe(2);
  });

  it('should display error message if match not found', () => {
    mockMatchApi.getById.mockReturnValue(of(null));
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toContain('not found');
  });
});
