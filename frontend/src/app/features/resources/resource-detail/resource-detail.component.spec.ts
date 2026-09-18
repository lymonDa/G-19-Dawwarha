import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ResourceDetailComponent } from './resource-detail.component';
import { ResourceApiService } from '../resource-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Resource } from '../../../core/models/resource.model';

describe('ResourceDetailComponent', () => {
  let component: ResourceDetailComponent;
  let fixture: ComponentFixture<ResourceDetailComponent>;

  let mockResourceApi: {
    get: ReturnType<typeof vi.fn>;
    transitionStatus: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
  };
  let mockAuthService: {
    currentUser: ReturnType<typeof vi.fn>;
    isAdmin: ReturnType<typeof vi.fn>;
  };
  let mockToast: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const sampleResource: Resource = {
    id: 'res-101',
    _id: 'res-101',
    title: 'Wheelchair in great condition',
    categoryId: 'cat-med',
    category: { id: 'cat-med', name: 'Medical Equipment', isActive: true },
    quantity: 1,
    description: 'Foldable wheelchair with handbrakes',
    location: { city: 'Cairo', area: 'Maadi' },
    availabilityWindow: { start: '2026-10-01T00:00:00.000Z', end: '2026-10-15T00:00:00.000Z' },
    status: 'draft',
    providerId: 'user-1',
    safetyDisclosure: 'Cleaned and disinfected before storage',
    createdAt: '2026-09-01T00:00:00.000Z'
  };

  const setupTest = async (currentUserId: string, isAdmin = false) => {
    mockResourceApi = {
      get: vi.fn().mockReturnValue(of(sampleResource)),
      transitionStatus: vi.fn().mockReturnValue(of({ ...sampleResource, status: 'published' })),
      cancel: vi.fn().mockReturnValue(of({ ...sampleResource, status: 'cancelled' }))
    };

    mockAuthService = {
      currentUser: vi.fn().mockReturnValue({ id: currentUserId }),
      isAdmin: vi.fn().mockReturnValue(isAdmin)
    };

    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ResourceDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ResourceApiService, useValue: mockResourceApi },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToast },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'res-101' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Owner View', () => {
    beforeEach(async () => {
      await setupTest('user-1'); // Owner
    });

    it('should load resource details on init', () => {
      expect(mockResourceApi.get).toHaveBeenCalledWith('res-101');
      expect(component.resource()?.title).toBe('Wheelchair in great condition');
      expect(component.isOwner()).toBe(true);
      expect(component.canManage()).toBe(true);
    });

    it('should correctly map lifecycle step for LifecycleTimeline', () => {
      expect(component.timelineStep()).toBe('draft');
      expect(component.terminalState()).toBe('none');

      component.resource.set({ ...sampleResource, status: 'published' });
      expect(component.timelineStep()).toBe('published');

      component.resource.set({ ...sampleResource, status: 'cancelled' });
      expect(component.terminalState()).toBe('cancelled');
    });

    it('should allow owner to publish a draft resource', () => {
      component.transitionStatus('publish');

      expect(mockResourceApi.transitionStatus).toHaveBeenCalledWith('res-101', 'publish');
      expect(mockToast.success).toHaveBeenCalledWith("Resource status transitioned to 'published'");
      expect(component.resource()?.status).toBe('published');
    });

    it('should open cancel confirmation dialog and cancel resource upon confirmation', () => {
      component.openCancelDialog();
      expect(component.showCancelDialog()).toBe(true);

      component.confirmCancel();
      expect(mockResourceApi.cancel).toHaveBeenCalledWith('res-101');
      expect(mockToast.success).toHaveBeenCalledWith('Resource cancelled successfully');
      expect(component.resource()?.status).toBe('cancelled');
    });
  });

  describe('Non-Owner / Seeker View', () => {
    beforeEach(async () => {
      await setupTest('other-user-999'); // Not owner
    });

    it('should not allow non-owner to manage or transition resource', () => {
      expect(component.isOwner()).toBe(false);
      expect(component.canManage()).toBe(false);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).not.toContain('Publish Listing');
      expect(el.textContent).not.toContain('Cancel Listing');
      expect(el.textContent).toContain('View Matching Demands');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await setupTest('user-1');
    });

    it('should display error message on API failure', () => {
      mockResourceApi.get.mockReturnValue(throwError(() => ({ error: { message: 'Resource not found' } })));
      component.loadResource('invalid-id');

      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBe('Resource not found');
    });
  });
});
