import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AdminUsersComponent } from './admin-users.component';
import { ApiBaseService } from '../../../core/services/api-base.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user.model';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let mockApi: any;
  let mockToast: any;

  const mockUsersList: User[] = [
    {
      id: 'u1',
      name: 'Ahmed Mahmoud',
      email: 'ahmed@dawwarha.org',
      role: 'user',
      status: 'active',
      createdAt: '2026-02-10T10:00:00Z'
    },
    {
      id: 'u2',
      name: 'Resalat Al-Kheir',
      email: 'resalat@dawwarha.org',
      role: 'organization',
      status: 'suspended',
      createdAt: '2026-01-15T14:30:00Z'
    }
  ];

  beforeEach(() => {
    mockApi = {
      get: vi.fn().mockReturnValue(of({ success: true, data: mockUsersList, pagination: { total: 2, totalPages: 1 } })),
      put: vi.fn()
    };
    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AdminUsersComponent,
        { provide: ApiBaseService, useValue: mockApi },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    component = TestBed.inject(AdminUsersComponent);
  });

  it('should initialize and load users on ngOnInit', () => {
    component.ngOnInit();
    expect(mockApi.get).toHaveBeenCalledWith('/admin/users', expect.objectContaining({ page: 1, limit: 10 }));
    expect(component.users().length).toBe(2);
    expect(component.total()).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should call suspend endpoint when suspending active user', () => {
    mockApi.put.mockReturnValue(of({ success: true }));
    component.selectedUser.set(mockUsersList[0]); // active user
    component.executeStatusToggle();

    expect(mockApi.put).toHaveBeenCalledWith('/admin/users/u1/suspend', {});
    expect(mockToast.success).toHaveBeenCalledWith('User suspended successfully');
    expect(component.isDialogOpen()).toBe(false);
  });

  it('should call reactivate endpoint when reactivating suspended user', () => {
    mockApi.put.mockReturnValue(of({ success: true }));
    component.selectedUser.set(mockUsersList[1]); // suspended user
    component.executeStatusToggle();

    expect(mockApi.put).toHaveBeenCalledWith('/admin/users/u2/reactivate', {});
    expect(mockToast.success).toHaveBeenCalledWith('User reactivated successfully');
    expect(component.isDialogOpen()).toBe(false);
  });

  it('should display error toast and not update fake state when API call fails', () => {
    mockApi.put.mockReturnValue(throwError(() => ({ message: 'Server down' })));
    component.selectedUser.set(mockUsersList[0]);
    component.executeStatusToggle();

    expect(mockToast.error).toHaveBeenCalledWith('Server down');
    expect(component.isDialogOpen()).toBe(false);
  });

  it('should reset page to 1 on search change', () => {
    component.page.set(3);
    component.searchQuery = 'resalat';
    component.onSearchChange();

    expect(component.page()).toBe(1);
    expect(mockApi.get).toHaveBeenCalledWith('/admin/users', expect.objectContaining({ search: 'resalat' }));
  });
});
