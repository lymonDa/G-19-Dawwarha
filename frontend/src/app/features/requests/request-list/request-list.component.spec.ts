import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RequestListComponent } from './request-list.component';
import { RequestApiService } from '../services/request-api.service';
import { Request } from '../../../core/models/request.model';

describe('RequestListComponent', () => {
  let component: RequestListComponent;
  let fixture: ComponentFixture<RequestListComponent>;
  let mockApi: {
    getAll: ReturnType<typeof vi.fn>;
    getCategories: ReturnType<typeof vi.fn>;
  };

  const sampleRequests: Request[] = [
    {
      _id: 'req1',
      id: 'req1',
      requesterId: 'user1',
      categoryId: { _id: 'cat1', name: 'Medical Equipment' },
      quantity: 5,
      urgency: 'high',
      location: { city: 'Cairo', area: 'Maadi' },
      description: 'Wheelchair needed urgently',
      status: 'published',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'req2',
      id: 'req2',
      requesterId: 'user2',
      categoryId: { _id: 'cat2', name: 'Educational Materials' },
      quantity: 20,
      urgency: 'low',
      location: { city: 'Giza', area: 'Dokki' },
      description: 'Books for school library',
      status: 'published',
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    mockApi = {
      getAll: vi.fn().mockReturnValue(
        of({
          success: true,
          data: sampleRequests,
          pagination: { total: 2, page: 1, limit: 12, pages: 1 }
        })
      ),
      getCategories: vi.fn().mockReturnValue(
        of({
          success: true,
          data: [
            { _id: 'cat1', name: 'Medical Equipment' },
            { _id: 'cat2', name: 'Educational Materials' }
          ]
        })
      )
    };

    await TestBed.configureTestingModule({
      imports: [RequestListComponent],
      providers: [
        { provide: RequestApiService, useValue: mockApi },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load categories and requests on initialization', () => {
    fixture.detectChanges();
    expect(mockApi.getCategories).toHaveBeenCalled();
    expect(mockApi.getAll).toHaveBeenCalled();
    expect(component.requests.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should render loading skeleton when loading', () => {
    mockApi.getAll.mockReturnValue(new (require('rxjs').Subject)());
    fixture.detectChanges();
    expect(component.loading).toBe(true);
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.querySelector('app-skeleton')).toBeTruthy();
  });

  it('should render empty state when no requests are found', () => {
    mockApi.getAll.mockReturnValue(
      of({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 12, pages: 0 }
      })
    );
    fixture.detectChanges();
    expect(component.filteredRequests.length).toBe(0);
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.querySelector('app-empty-state')).toBeTruthy();
  });

  it('should filter requests on client-side search keyword', () => {
    fixture.detectChanges();
    component.searchTerm = 'wheelchair';
    const filtered = component.filteredRequests;
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('req1');
  });

  it('should apply client-side urgency filter fallback (Cross-Engineer Gap)', () => {
    fixture.detectChanges();
    component.selectedUrgency = 'high';
    const filtered = component.filteredRequests;
    expect(filtered.length).toBe(1);
    expect(filtered[0].urgency).toBe('high');

    component.selectedUrgency = 'low';
    expect(component.filteredRequests.length).toBe(1);
    expect(component.filteredRequests[0].urgency).toBe('low');
  });

  it('should handle API error gracefully', () => {
    mockApi.getAll.mockReturnValue(
      throwError(() => ({ error: { message: 'Network failure' } }))
    );
    fixture.detectChanges();
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Network failure');
  });

  it('should reset all filters and reload', () => {
    fixture.detectChanges();
    component.searchTerm = 'test';
    component.selectedCategory = 'cat1';
    component.selectedUrgency = 'high';
    component.resetFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedCategory).toBe('');
    expect(component.selectedUrgency).toBe('');
    expect(mockApi.getAll).toHaveBeenCalled();
  });
});
