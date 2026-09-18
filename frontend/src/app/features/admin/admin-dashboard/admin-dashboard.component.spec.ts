import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminApiService, AdminAnalyticsData } from '../admin-api.service';
import { of, throwError } from 'rxjs';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let mockAdminApi: any;

  const mockAnalytics: AdminAnalyticsData = {
    summary: {
      totalUsers: 150,
      activeUsers: 140,
      resourcesPublished: 210,
      completedTransfers: 95,
      requestsCreated: 120,
      openReports: 4,
      registeredOrganizations: 18
    },
    resourcesByCategory: [
      { categoryId: 'cat-1', total: 50, published: 40, fulfilled: 10, byStatus: [] }
    ],
    categoryImpact: [
      { categoryId: 'cat-1', completedTransfers: 30, totalQuantity: 75 }
    ],
    matchAcceptance: {
      total: 100,
      proposed: 10,
      accepted: 80,
      rejected: 10,
      acceptanceRate: 0.8889,
      byStatus: []
    }
  };

  beforeEach(() => {
    mockAdminApi = {
      getAnalytics: vi.fn().mockReturnValue(of(mockAnalytics))
    };

    TestBed.configureTestingModule({
      providers: [
        AdminDashboardComponent,
        { provide: AdminApiService, useValue: mockAdminApi }
      ]
    });

    component = TestBed.inject(AdminDashboardComponent);
  });

  it('should initialize and load live platform analytics', () => {
    component.ngOnInit();
    expect(mockAdminApi.getAnalytics).toHaveBeenCalled();
    expect(component.analytics()).toEqual(mockAnalytics);
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should handle analytics fetch error gracefully', () => {
    mockAdminApi.getAnalytics.mockReturnValue(throwError(() => new Error('Network error')));
    component.loadAnalytics();
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBe('Network error');
    expect(component.analytics()).toBeNull();
  });

  it('should expose real summary values rather than hardcoded metrics', () => {
    component.ngOnInit();
    const data = component.analytics();
    expect(data?.summary.resourcesPublished).toBe(210);
    expect(data?.summary.requestsCreated).toBe(120);
    expect(data?.summary.completedTransfers).toBe(95);
    expect(data?.summary.registeredOrganizations).toBe(18);
  });
});
