import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RequestDetailComponent } from './request-detail.component';
import { RequestApiService } from '../services/request-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Request } from '../../../core/models/request.model';

describe('RequestDetailComponent', () => {
  let component: RequestDetailComponent;
  let fixture: ComponentFixture<RequestDetailComponent>;
  let mockApi: {
    getById: ReturnType<typeof vi.fn>;
    changeStatus: ReturnType<typeof vi.fn>;
  };
  let mockToast: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const sampleRequest: Request = {
    _id: 'req123',
    id: 'req123',
    requesterId: 'user1',
    categoryId: { _id: 'cat1', name: 'Electronics' },
    quantity: 3,
    urgency: 'medium',
    location: { city: 'Giza' },
    status: 'draft',
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    mockApi = {
      getById: vi.fn().mockReturnValue(of(sampleRequest)),
      changeStatus: vi.fn()
    };
    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RequestDetailComponent],
      providers: [
        provideRouter([]),
        { provide: RequestApiService, useValue: mockApi },
        { provide: ToastService, useValue: mockToast },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'req123' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load request details by ID on init', () => {
    expect(mockApi.getById).toHaveBeenCalledWith('req123');
    expect(component.request).toBeTruthy();
    expect(component.categoryName).toBe('Electronics');
    expect(component.loading).toBe(false);
  });

  it('should render LifecycleTimelineComponent and specifications in DOM', () => {
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.querySelector('app-lifecycle-timeline')).toBeTruthy();
    expect(nativeEl.textContent).toContain('Electronics');
    expect(nativeEl.textContent).toContain('3 units');
    expect(nativeEl.textContent).toContain('Giza');
  });

  it('should publish draft request and show toast notification', () => {
    const publishedRequest: Request = {
      ...sampleRequest,
      status: 'published'
    };
    mockApi.changeStatus.mockReturnValue(of(publishedRequest));

    component.publishRequest();
    expect(mockApi.changeStatus).toHaveBeenCalledWith('req123', 'publish');
    expect(component.request?.status).toBe('published');
    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringContaining('published successfully')
    );
  });

  it('should handle publish error with error toast', () => {
    mockApi.changeStatus.mockReturnValue(
      throwError(() => ({ error: { message: 'Cannot publish in current state' } }))
    );

    component.publishRequest();
    expect(mockToast.error).toHaveBeenCalledWith('Cannot publish in current state');
    expect(component.errorMessage).toBe('Cannot publish in current state');
  });

  it('should open cancel confirmation dialog when promptCancel is called', () => {
    expect(component.showCancelConfirm).toBe(false);
    component.promptCancel();
    expect(component.showCancelConfirm).toBe(true);

    component.dismissCancel();
    expect(component.showCancelConfirm).toBe(false);
  });

  it('should cancel request via confirmCancel and show toast notification', () => {
    const cancelledRequest: Request = {
      ...sampleRequest,
      status: 'cancelled'
    };
    mockApi.changeStatus.mockReturnValue(of(cancelledRequest));

    component.promptCancel();
    component.confirmCancel();

    expect(mockApi.changeStatus).toHaveBeenCalledWith('req123', 'cancel');
    expect(component.request?.status).toBe('cancelled');
    expect(mockToast.success).toHaveBeenCalledWith('Request has been cancelled.');
  });
});
