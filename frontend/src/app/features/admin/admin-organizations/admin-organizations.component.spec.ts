import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AdminOrganizationsComponent } from './admin-organizations.component';
import { AdminApiService } from '../admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { Organization } from '../../../core/models/organization.model';

describe('AdminOrganizationsComponent', () => {
  let component: AdminOrganizationsComponent;
  let mockAdminApi: any;
  let mockToast: any;

  const mockOrgs: Organization[] = [
    {
      id: 'org-1',
      name: 'Resalat Al-Amal',
      type: 'ngo',
      verificationStatus: 'pending',
      ownerUserId: 'user-1',
      contact: { email: 'contact@org1.org', phone: '0100000000', address: 'Cairo', city: 'Cairo' },
      createdAt: '2026-02-01T10:00:00Z'
    },
    {
      id: 'org-2',
      name: 'Misr Al-Kheir',
      type: 'charity',
      verificationStatus: 'verified',
      ownerUserId: 'user-2',
      contact: { email: 'contact@org2.org', phone: '0110000000', address: 'Giza', city: 'Giza' },
      createdAt: '2026-01-15T10:00:00Z'
    }
  ];

  beforeEach(() => {
    mockAdminApi = {
      getOrganizations: vi.fn().mockReturnValue(of(mockOrgs)),
      verifyOrganization: vi.fn().mockReturnValue(of({ ...mockOrgs[0], verificationStatus: 'verified' }))
    };
    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AdminOrganizationsComponent,
        { provide: AdminApiService, useValue: mockAdminApi },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    component = TestBed.inject(AdminOrganizationsComponent);
  });

  it('should initialize and load organizations', () => {
    component.ngOnInit();
    expect(mockAdminApi.getOrganizations).toHaveBeenCalled();
    expect(component.organizations().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should approve organization with decision "approved" and no rejectionReason', () => {
    component.handleApprove(mockOrgs[0]);

    expect(mockAdminApi.verifyOrganization).toHaveBeenCalledWith('org-1', {
      decision: 'approved'
    });
    expect(mockToast.success).toHaveBeenCalled();
  });

  it('should open rejection dialog when openRejectDialog is called', () => {
    component.openRejectDialog(mockOrgs[0]);

    expect(component.isRejectDialogOpen()).toBe(true);
    expect(component.selectedOrgForReject()?.id).toBe('org-1');
    expect(component.rejectionReason).toBe('');
    expect(component.rejectionError).toBe('');
  });

  it('should prevent rejection submission if rejectionReason is empty', () => {
    component.openRejectDialog(mockOrgs[0]);
    component.rejectionReason = '   ';
    component.confirmReject();

    expect(mockAdminApi.verifyOrganization).not.toHaveBeenCalled();
    expect(component.rejectionError).toBeTruthy();
  });

  it('should submit rejection with decision "rejected" and rejectionReason when valid', () => {
    component.openRejectDialog(mockOrgs[0]);
    component.rejectionReason = 'The official registration certificate is expired.';
    component.confirmReject();

    expect(mockAdminApi.verifyOrganization).toHaveBeenCalledWith('org-1', {
      decision: 'rejected',
      rejectionReason: 'The official registration certificate is expired.'
    });
    expect(mockToast.success).toHaveBeenCalled();
    expect(component.isRejectDialogOpen()).toBe(false);
  });

  it('should display error state and zero fake data when API fails', () => {
    mockAdminApi.getOrganizations.mockReturnValue(throwError(() => ({ message: 'Network connection lost' })));
    component.loadOrganizations();

    expect(component.organizations().length).toBe(0);
    expect(component.errorMessage()).toBe('Network connection lost');
    expect(component.isLoading()).toBe(false);
  });
});
