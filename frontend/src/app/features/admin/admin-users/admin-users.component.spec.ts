import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AdminUsersComponent } from './admin-users.component';
import { AdminApiService } from '../admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user.model';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let mockAdminApi: any;
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
      role: 'user',
      status: 'suspended',
      createdAt: '2026-01-15T14:30:00Z'
    }
  ];

  beforeEach(() => {
    mockAdminApi = {
      getUsers: vi.fn().mockReturnValue(of({ data: mockUsersList, total: 2, totalPages: 1, page: 1, limit: 10 })),
      suspendUser: vi.fn(),
      reactivateUser: vi.fn()
    };
    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AdminUsersComponent,
        { provide: AdminApiService, useValue: mockAdminApi },
        { provide: ToastService, useValue: mockToast }
      ]
    });

    component = TestBed.inject(AdminUsersComponent);
  });

  it('should initialize and load users on ngOnInit', () => {
    component.ngOnInit();
    expect(mockAdminApi.getUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }));
    expect(component.users().length).toBe(2);
    expect(component.total()).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should call suspend endpoint when suspending active user', () => {
    mockAdminApi.suspendUser.mockReturnValue(of(mockUsersList[0]));
    component.selectedUser.set(mockUsersList[0]); // active user
    component.executeStatusToggle();

    expect(mockAdminApi.suspendUser).toHaveBeenCalledWith('u1');
    expect(mockToast.success).toHaveBeenCalledWith('User suspended successfully');
    expect(component.isDialogOpen()).toBe(false);
  });

  it('should call reactivate endpoint when reactivating suspended user', () => {
    mockAdminApi.reactivateUser.mockReturnValue(of(mockUsersList[1]));
    component.selectedUser.set(mockUsersList[1]); // suspended user
    component.executeStatusToggle();

    expect(mockAdminApi.reactivateUser).toHaveBeenCalledWith('u2');
    expect(mockToast.success).toHaveBeenCalledWith('User reactivated successfully');
    expect(component.isDialogOpen()).toBe(false);
  });

  it('should display error toast and not update fake state when API call fails', () => {
    mockAdminApi.suspendUser.mockReturnValue(throwError(() => ({ message: 'Server down' })));
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
    expect(mockAdminApi.getUsers).toHaveBeenCalledWith(expect.objectContaining({ search: 'resalat' }));
  });
});
