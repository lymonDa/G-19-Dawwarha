import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RequestFormComponent } from './request-form.component';
import { RequestApiService } from '../services/request-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Request } from '../../../core/models/request.model';
import { CategoryApiService } from '../../categories/category-api.service';

import { LucideAngularModule, ChevronDown, Check, X, Search, AlertCircle } from 'lucide-angular';

describe('RequestFormComponent', () => {
  let component: RequestFormComponent;
  let fixture: ComponentFixture<RequestFormComponent>;
  let router: Router;
  let mockApi: {
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    getCategories: ReturnType<typeof vi.fn>;
  };
  let mockToast: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const sampleRequest: Request = {
    _id: 'req123',
    id: 'req123',
    requesterId: 'user1',
    categoryId: { _id: 'cat123', name: 'Wheelchairs' },
    quantity: 5,
    urgency: 'high',
    location: { city: 'Cairo', area: 'Dokki' },
    description: 'Need supplies urgently',
    status: 'draft',
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    mockApi = {
      getById: vi.fn().mockReturnValue(of(sampleRequest)),
      create: vi.fn().mockReturnValue(of(sampleRequest)),
      update: vi.fn().mockReturnValue(of(sampleRequest)),
      getCategories: vi.fn().mockReturnValue(of([]))
    };
    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    const mockCategoryApi = {
      getCategories: vi.fn().mockReturnValue(of([])),
      list: vi.fn().mockReturnValue(of([])),
      isLoading: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [
        RequestFormComponent,
        LucideAngularModule.pick({ ChevronDown, Check, X, Search, AlertCircle })
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: RequestApiService, useValue: mockApi },
        { provide: CategoryApiService, useValue: mockCategoryApi },
        { provide: ToastService, useValue: mockToast },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(RequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should validate form when valid values are provided', () => {
    component.form.patchValue({
      categoryId: 'cat123',
      quantity: 5,
      urgency: 'high',
      location: {
        city: 'Cairo',
        area: 'Dokki'
      },
      description: 'Need supplies urgently'
    });
    expect(component.form.valid).toBe(true);
  });

  it('should invalidate quantity less than 1', () => {
    component.form.patchValue({
      categoryId: 'cat123',
      quantity: 0,
      urgency: 'medium',
      location: { city: 'Cairo' }
    });
    expect(component.form.get('quantity')?.valid).toBe(false);
  });

  it('should submit new request and navigate to details with success toast', () => {
    component.isEdit = false;
    component.form.patchValue({
      categoryId: 'cat123',
      quantity: 5,
      urgency: 'high',
      location: { city: 'Cairo', area: 'Dokki' },
      description: 'Need supplies urgently'
    });

    component.submit();

    expect(mockApi.create).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith('Request created successfully.');
    expect(router.navigate).toHaveBeenCalledWith(['/requests', 'req123']);
  });

  it('should submit updated request in edit mode and navigate to details', () => {
    component.isEdit = true;
    component.requestId = 'req123';
    component.form.patchValue({
      categoryId: 'cat123',
      quantity: 8,
      urgency: 'high',
      location: { city: 'Cairo', area: 'Dokki' },
      description: 'Updated description'
    });

    component.submit();

    expect(mockApi.update).toHaveBeenCalledWith('req123', expect.objectContaining({ quantity: 8 }));
    expect(mockToast.success).toHaveBeenCalledWith('Request updated successfully.');
    expect(router.navigate).toHaveBeenCalledWith(['/requests', 'req123']);
  });

  it('should load existing request and pre-fill form when editing', () => {
    component.requestId = 'req123';
    component.isEdit = true;
    component.loadExistingRequest();

    expect(mockApi.getById).toHaveBeenCalledWith('req123');
    expect(component.form.get('quantity')?.value).toBe(5);
    expect(component.form.get('urgency')?.value).toBe('high');
    expect(component.form.get('location.city')?.value).toBe('Cairo');
  });

  it('should disable form and set error message if editing request in terminal state', () => {
    const fulfilledRequest: Request = {
      ...sampleRequest,
      status: 'fulfilled'
    };
    mockApi.getById.mockReturnValue(of(fulfilledRequest));

    component.requestId = 'req123';
    component.isEdit = true;
    component.loadExistingRequest();

    expect(component.form.disabled).toBe(true);
    expect(component.errorMessage).toContain('fulfilled and can no longer be edited');
  });

  it('should handle conflict error on submit gracefully', () => {
    mockApi.create.mockReturnValue(
      throwError(() => ({ status: 409, error: { message: 'Conflict' } }))
    );

    component.form.patchValue({
      categoryId: 'cat123',
      quantity: 2,
      urgency: 'low',
      location: { city: 'Giza' }
    });

    component.submit();

    expect(component.saving).toBe(false);
    expect(component.errorMessage).toContain('conflicting request already exists');
    expect(mockToast.error).toHaveBeenCalled();
  });
});
