import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ResourceListComponent } from './resource-list.component';
import { ResourceApiService, ResourcesPage } from '../resource-api.service';
import { CategoryApiService } from '../../categories/category-api.service';
import { Resource } from '../../../core/models/resource.model';
import { Category } from '../../../core/models/category.model';

describe('ResourceListComponent', () => {
  let component: ResourceListComponent;
  let fixture: ComponentFixture<ResourceListComponent>;

  let mockResourceApi: {
    list: ReturnType<typeof vi.fn>;
  };
  let mockCategoryApi: {
    list: ReturnType<typeof vi.fn>;
    isLoading: ReturnType<typeof signal>;
  };

  const sampleResources: Resource[] = [
    {
      id: 'res-1',
      title: 'Foldable Medical Wheelchair',
      categoryId: 'cat-med',
      quantity: 1,
      description: 'Sanitized wheelchair in Maadi',
      location: { city: 'Cairo', area: 'Maadi' },
      availabilityWindow: { start: '2026-10-01', end: '2026-10-15' },
      status: 'available',
      providerId: 'user-1',
      createdAt: '2026-09-01'
    },
    {
      id: 'res-2',
      title: 'Study Desks and Chairs',
      categoryId: 'cat-furn',
      quantity: 5,
      description: 'Office surplus desks in Dokki',
      location: { city: 'Giza', area: 'Dokki' },
      availabilityWindow: { start: '2026-10-01', end: '2026-10-20' },
      status: 'available',
      providerId: 'user-2',
      createdAt: '2026-09-02'
    }
  ];

  const sampleCategories: Category[] = [
    { id: 'cat-med', name: 'Medical Equipment', isActive: true },
    { id: 'cat-furn', name: 'Furniture', isActive: true },
    { id: 'cat-inactive', name: 'Old Category', isActive: false }
  ];

  beforeEach(async () => {
    mockResourceApi = {
      list: vi.fn().mockReturnValue(of({
        items: sampleResources,
        total: 2,
        page: 1,
        limit: 12,
        totalPages: 1
      } as ResourcesPage))
    };

    mockCategoryApi = {
      list: vi.fn().mockReturnValue(of(sampleCategories)),
      isLoading: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [ResourceListComponent],
      providers: [
        provideRouter([]),
        { provide: ResourceApiService, useValue: mockResourceApi },
        { provide: CategoryApiService, useValue: mockCategoryApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and fetch resources and categories on init', () => {
    expect(component).toBeTruthy();
    expect(mockCategoryApi.list).toHaveBeenCalled();
    expect(mockResourceApi.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 12 }));
    expect(component.categories().length).toBe(2); // Inactive category filtered out
    expect(component.displayedResources().length).toBe(2);
  });

  it('should filter resources using client-side keyword search query', () => {
    component.searchQuery = 'Wheelchair';
    expect(component.displayedResources().length).toBe(1);
    expect(component.displayedResources()[0].id).toBe('res-1');

    component.searchQuery = 'Dokki';
    expect(component.displayedResources().length).toBe(1);
    expect(component.displayedResources()[0].id).toBe('res-2');

    component.searchQuery = 'NonExistent';
    expect(component.displayedResources().length).toBe(0);
  });

  it('should select category and trigger backend query with categoryId', () => {
    component.selectCategory('cat-med');
    expect(component.selectedCategoryId).toBe('cat-med');
    expect(mockResourceApi.list).toHaveBeenCalledWith(expect.objectContaining({
      categoryId: 'cat-med',
      page: 1
    }));
  });

  it('should filter by city and reset page', () => {
    component.cityFilter = 'Cairo';
    component.onFilterChange();
    expect(mockResourceApi.list).toHaveBeenCalledWith(expect.objectContaining({
      city: 'Cairo',
      page: 1
    }));
  });

  it('should reset all filters and refetch on resetFilters()', () => {
    component.searchQuery = 'test';
    component.cityFilter = 'Alex';
    component.selectedCategoryId = 'cat-med';

    component.resetFilters();

    expect(component.searchQuery).toBe('');
    expect(component.cityFilter).toBe('');
    expect(component.selectedCategoryId).toBeNull();
    expect(component.currentPage).toBe(1);
    expect(mockResourceApi.list).toHaveBeenCalled();
  });

  it('should handle pagination correctly', () => {
    mockResourceApi.list.mockReturnValue(of({
      items: sampleResources,
      total: 20,
      page: 2,
      limit: 12,
      totalPages: 3
    } as ResourcesPage));
    component.totalPages = 3;
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
    expect(mockResourceApi.list).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('should render error state and offer retry on API failure', () => {
    mockResourceApi.list.mockReturnValue(throwError(() => ({ error: { message: 'Network error' } })));
    component.fetchResources();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Network error');
  });
});
