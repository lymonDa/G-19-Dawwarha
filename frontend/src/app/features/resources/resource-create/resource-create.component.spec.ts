import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ResourceCreateComponent } from './resource-create.component';
import { ResourceApiService } from '../resource-api.service';
import { CategoryApiService } from '../../categories/category-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Resource } from '../../../core/models/resource.model';
import { LucideAngularModule, ChevronDown, Check, X, Search, AlertCircle } from 'lucide-angular';

describe('ResourceCreateComponent', () => {
  let component: ResourceCreateComponent;
  let fixture: ComponentFixture<ResourceCreateComponent>;
  let router: Router;

  let mockResourceApi: {
    get: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockCategoryApi: {
    list: ReturnType<typeof vi.fn>;
    isLoading: ReturnType<typeof signal>;
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
    id: 'res-1',
    title: 'Hospital Bed',
    categoryId: 'cat-med',
    quantity: 3,
    description: 'Electric adjustable hospital bed in good condition',
    location: { city: 'Cairo', area: 'Nasr City' },
    availabilityWindow: { start: '2026-10-01T00:00:00.000Z', end: '2026-10-20T00:00:00.000Z' },
    status: 'draft',
    providerId: 'user-1',
    createdAt: '2026-09-10T00:00:00.000Z'
  };

  const setupTest = async (routeParamId: string | null = null) => {
    mockResourceApi = {
      get: vi.fn().mockReturnValue(of(sampleResource)),
      create: vi.fn().mockReturnValue(of({ ...sampleResource, id: 'new-res-1' })),
      update: vi.fn().mockReturnValue(of(sampleResource))
    };

    mockCategoryApi = {
      list: vi.fn().mockReturnValue(of([{ id: 'cat-med', name: 'Medical', isActive: true }])),
      isLoading: signal(false)
    };

    mockAuthService = {
      currentUser: vi.fn().mockReturnValue({ id: 'user-1', role: 'user' }),
      isAdmin: vi.fn().mockReturnValue(false)
    };

    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ResourceCreateComponent,
        LucideAngularModule.pick({ ChevronDown, Check, X, Search, AlertCircle })
      ],
      providers: [
        provideRouter([]),
        { provide: ResourceApiService, useValue: mockResourceApi },
        { provide: CategoryApiService, useValue: mockCategoryApi },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToast },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? routeParamId : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(ResourceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Create Mode', () => {
    beforeEach(async () => {
      await setupTest(null);
    });

    it('should initialize empty form in create mode', () => {
      expect(component.isEdit).toBe(false);
      expect(component.form.valid).toBe(false);
    });

    it('should validate required fields', () => {
      component.form.controls['title'].setValue('Ab'); // Too short
      expect(component.titleError).toBe('Title must be at least 3 characters');

      component.form.controls['title'].setValue('');
      expect(component.titleError).toBe('Title is required');

      component.form.controls['quantity'].setValue(0);
      expect(component.quantityError).toBe('Quantity must be greater than 0');
    });

    it('should validate that availability endDate must be after startDate', () => {
      component.form.patchValue({
        startDate: '2026-10-15',
        endDate: '2026-10-10'
      });

      expect(component.form.errors?.['invalidDateRange']).toBe(true);
    });

    it('should submit valid form and call resourceApi.create', () => {
      component.form.patchValue({
        title: 'Foldable Wheelchair',
        categoryId: 'cat-med',
        quantity: 2,
        description: 'Clean and sanitized wheelchair for community use.',
        city: 'Cairo',
        area: 'Maadi',
        startDate: '2026-10-01',
        endDate: '2026-10-15'
      });

      expect(component.form.valid).toBe(true);

      component.onSubmit();

      expect(mockResourceApi.create).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Resource listed successfully');
      expect(router.navigate).toHaveBeenCalledWith(['/resources', 'new-res-1']);
    });

    it('should prevent double submission while request is in progress', () => {
      component.form.patchValue({
        title: 'Foldable Wheelchair',
        categoryId: 'cat-med',
        quantity: 2,
        description: 'Clean and sanitized wheelchair for community use.',
        city: 'Cairo',
        startDate: '2026-10-01',
        endDate: '2026-10-15'
      });

      component.isSubmitting = true;
      component.onSubmit();

      expect(mockResourceApi.create).not.toHaveBeenCalled();
    });

    it('should display error message on API failure', () => {
      mockResourceApi.create.mockReturnValue(
        throwError(() => ({ error: { message: 'Failed to create resource' } }))
      );

      component.form.patchValue({
        title: 'Foldable Wheelchair',
        categoryId: 'cat-med',
        quantity: 2,
        description: 'Clean and sanitized wheelchair for community use.',
        city: 'Cairo',
        startDate: '2026-10-01',
        endDate: '2026-10-15'
      });

      component.onSubmit();

      expect(component.isSubmitting).toBe(false);
      expect(component.errorMessage).toBe('Failed to create resource');
    });
  });

  describe('Edit Mode', () => {
    beforeEach(async () => {
      await setupTest('res-1');
    });

    it('should enter edit mode, fetch resource, and pre-fill form', () => {
      expect(component.isEdit).toBe(true);
      expect(component.resourceId).toBe('res-1');
      expect(mockResourceApi.get).toHaveBeenCalledWith('res-1');
      expect(component.form.value.title).toBe('Hospital Bed');
      expect(component.form.value.quantity).toBe(3);
      expect(component.form.value.city).toBe('Cairo');
    });

    it('should submit update and navigate to detail page', () => {
      component.form.patchValue({
        title: 'Hospital Bed (Updated)',
        quantity: 4
      });

      component.onSubmit();

      expect(mockResourceApi.update).toHaveBeenCalledWith('res-1', expect.objectContaining({
        title: 'Hospital Bed (Updated)',
        quantity: 4
      }));
      expect(mockToast.success).toHaveBeenCalledWith('Resource updated successfully');
      expect(router.navigate).toHaveBeenCalledWith(['/resources', 'res-1']);
    });

    it('should block editing on terminal states', () => {
      const terminalResource: Resource = {
        ...sampleResource,
        status: 'cancelled'
      };
      mockResourceApi.get.mockReturnValue(of(terminalResource));

      component.ngOnInit();

      expect(component.terminalBlocked).toBe(true);
    });
  });
});
