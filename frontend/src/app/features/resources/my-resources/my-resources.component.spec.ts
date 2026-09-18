import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MyResourcesComponent } from './my-resources.component';
import { ResourceApiService } from '../resource-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Resource } from '../../../core/models/resource.model';

describe('MyResourcesComponent', () => {
  let component: MyResourcesComponent;
  let fixture: ComponentFixture<MyResourcesComponent>;

  let mockResourceApi: {
    listMine: ReturnType<typeof vi.fn>;
  };
  let mockAuthService: {
    currentUser: ReturnType<typeof vi.fn>;
  };

  const sampleMyResources: Resource[] = [
    {
      id: 'res-1',
      title: 'Active Wheelchair',
      categoryId: 'cat-med',
      quantity: 1,
      description: 'Available wheelchair',
      location: { city: 'Cairo' },
      availabilityWindow: { start: '2026-10-01', end: '2026-10-15' },
      status: 'available',
      providerId: 'current-user-1',
      createdAt: '2026-09-01'
    },
    {
      id: 'res-2',
      title: 'Matched Desks',
      categoryId: 'cat-furn',
      quantity: 5,
      description: 'In matching progress',
      location: { city: 'Giza' },
      availabilityWindow: { start: '2026-10-01', end: '2026-10-20' },
      status: 'matched',
      providerId: 'current-user-1',
      createdAt: '2026-09-02'
    },
    {
      id: 'res-3',
      title: 'Completed Handover Books',
      categoryId: 'cat-edu',
      quantity: 20,
      description: 'Successfully distributed',
      location: { city: 'Cairo' },
      availabilityWindow: { start: '2026-09-01', end: '2026-09-10' },
      status: 'completed',
      providerId: 'current-user-1',
      createdAt: '2026-08-15'
    }
  ];

  beforeEach(async () => {
    mockResourceApi = {
      listMine: vi.fn().mockReturnValue(of(sampleMyResources))
    };

    mockAuthService = {
      currentUser: vi.fn().mockReturnValue({ id: 'current-user-1' })
    };

    await TestBed.configureTestingModule({
      imports: [MyResourcesComponent],
      providers: [
        provideRouter([]),
        { provide: ResourceApiService, useValue: mockResourceApi },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and fetch user-owned resources on init', () => {
    expect(component).toBeTruthy();
    expect(mockResourceApi.listMine).toHaveBeenCalledWith('current-user-1');
    expect(component.resources().length).toBe(3);
    expect(component.displayedResources().length).toBe(3); // All tab
  });

  it('should calculate tab counts correctly', () => {
    expect(component.getCountForTab('all')).toBe(3);
    expect(component.getCountForTab('available')).toBe(1);
    expect(component.getCountForTab('progress')).toBe(1);
    expect(component.getCountForTab('completed')).toBe(1);
    expect(component.getCountForTab('inactive')).toBe(0);
  });

  it('should filter displayed resources when selecting a status tab', () => {
    component.selectTab('available');
    expect(component.displayedResources().length).toBe(1);
    expect(component.displayedResources()[0].id).toBe('res-1');

    component.selectTab('progress');
    expect(component.displayedResources().length).toBe(1);
    expect(component.displayedResources()[0].id).toBe('res-2');

    component.selectTab('inactive');
    expect(component.displayedResources().length).toBe(0);
  });

  it('should render empty state when a tab has no matching resources', () => {
    component.selectTab('inactive');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No resources found');
  });

  it('should handle API errors and show error banner', () => {
    mockResourceApi.listMine.mockReturnValue(throwError(() => ({ error: { message: 'Failed to fetch' } })));
    component.fetchMyResources();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Failed to fetch');
  });
});
