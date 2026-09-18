import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AdminReportsComponent } from './admin-reports.component';
import { ReportApiService } from '../../reports/report-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { Report } from '../../../core/models/report.model';

describe('AdminReportsComponent', () => {
  let component: AdminReportsComponent;
  let mockReportApi: any;
  let mockToast: any;

  const mockReports: Report[] = [
    {
      id: 'rep-1',
      reporterId: 'user-1',
      targetType: 'resource',
      targetId: 'res-1',
      reason: 'inappropriate',
      description: 'Misleading description',
      status: 'open',
      createdAt: '2026-03-01T10:00:00Z'
    },
    {
      id: 'rep-2',
      reporterId: 'user-2',
      targetType: 'user',
      targetId: 'user-3',
      reason: 'spam',
      description: 'Repeated spam requests',
      status: 'resolved',
      resolution: 'Account warned and spam cleaned',
      reviewedBy: 'admin-1',
      createdAt: '2026-02-28T10:00:00Z'
    }
  ];

  beforeEach(() => {
    mockReportApi = {
      listReportsForAdmin: vi.fn().mockReturnValue(of({ reports: mockReports, pagination: { total: 2, page: 1, limit: 20, totalPages: 1 } })),
      resolveReport: vi.fn().mockReturnValue(of({ ...mockReports[0], status: 'resolved', resolution: 'Investigated and resolved' }))
    };
    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AdminReportsComponent,
        { provide: ReportApiService, useValue: mockReportApi },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    component = TestBed.inject(AdminReportsComponent);
    component.ngOnInit();
  });

  it('should initialize and load reports', () => {
    component.ngOnInit();
    expect(mockReportApi.listReportsForAdmin).toHaveBeenCalled();
    expect(component.reports().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should open resolution dialog for selected report', () => {
    component.openResolutionDialog(mockReports[0]);
    expect(component.isDialogOpen()).toBe(true);
    expect(component.activeReport()).toEqual(mockReports[0]);
    expect(component.resolutionNotes).toBe('');
    expect(component.resolutionStatus).toBe('resolved');
  });

  it('should submit report resolution and update report in local state', () => {
    component.openResolutionDialog(mockReports[0]);
    component.resolutionNotes = 'Investigated and resolved';
    component.resolutionStatus = 'resolved';

    component.submitResolution();
    expect(mockReportApi.resolveReport).toHaveBeenCalledWith('rep-1', {
      resolution: 'Investigated and resolved',
      status: 'resolved'
    });
    expect(mockToast.success).toHaveBeenCalledWith('Report resolved successfully');
    expect(component.isDialogOpen()).toBe(false);
    expect(component.reports()[0].status).toBe('resolved');
  });

  it('should prevent resolution submission without resolution notes', () => {
    component.openResolutionDialog(mockReports[0]);
    component.resolutionNotes = '   ';

    component.submitResolution();
    expect(mockReportApi.resolveReport).not.toHaveBeenCalled();
    expect(component.dialogError()).toBe('Resolution notes are required.');
  });
});
