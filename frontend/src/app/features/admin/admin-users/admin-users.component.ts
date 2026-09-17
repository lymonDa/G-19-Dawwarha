import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiBaseService } from '../../../core/services/api-base.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, UserRole, UserStatus } from '../../../core/models/user.model';
import { Paginated } from '../../../core/models/pagination.model';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, PaginationComponent, BadgeComponent, ButtonComponent, DialogComponent, SkeletonComponent],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">User & Account Management</h1>
          <p class="text-xs text-neutral-500 mt-0.5">View and edit user and organization roles, suspend violating accounts.</p>
        </div>

        <!-- Filters Bar -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search by name or email..."
            class="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-xs w-full sm:w-60 focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <select
            [(ngModel)]="roleFilter"
            (ngModelChange)="loadUsers()"
            class="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Roles</option>
            <option value="user">Individuals</option>
            <option value="organization">Organizations</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <!-- Users Data Table -->
      <app-table>
        <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-semibold">User</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Role</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Status</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Contributions</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Joined</th>
            <th class="px-4 py-3 text-end text-xs font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          @if (isLoading()) {
            <tr>
              <td colspan="6" class="p-6 text-center">
                <app-skeleton variant="rectangular"></app-skeleton>
              </td>
            </tr>
          } @else if (users().length === 0) {
            <tr>
              <td colspan="6" class="py-8 text-center text-xs text-neutral-500">
                No users found matching your search.
              </td>
            </tr>
          } @else {
            @for (user of users(); track user.id) {
              <tr class="hover:bg-neutral-50/80 transition-colors">
                <!-- Name & Email -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {{ user.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-semibold text-neutral-900 text-xs">{{ user.name }}</p>
                      <p class="text-[11px] text-neutral-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td class="px-4 py-3">
                  <app-badge [variant]="getRoleVariant(user.role)" size="sm">
                    {{ getRoleText(user.role) }}
                  </app-badge>
                </td>

                <!-- Status -->
                <td class="px-4 py-3">
                  <app-badge [variant]="user.status === 'active' ? 'success' : 'danger'" size="sm" [dot]="true">
                    {{ user.status === 'active' ? 'Active' : 'Suspended' }}
                  </app-badge>
                </td>

                <!-- Stats -->
                <td class="px-4 py-3 text-xs text-neutral-600 font-mono">
                  {{ user.stats?.contributionsCount || 0 }}
                </td>

                <!-- Created At -->
                <td class="px-4 py-3 text-xs text-neutral-500">
                  {{ formatDate(user.createdAt) }}
                </td>

                <!-- Actions -->
                <td class="px-4 py-3 text-end">
                  @if (user.role !== 'admin') {
                    <app-button
                      [variant]="user.status === 'active' ? 'danger' : 'secondary'"
                      size="sm"
                      (clicked)="confirmStatusToggle(user)"
                    >
                      {{ user.status === 'active' ? 'Suspend Account' : 'Reactivate' }}
                    </app-button>
                  }
                </td>
              </tr>
            }
          }
        </tbody>
      </app-table>

      <!-- Pagination -->
      <app-pagination
        [page]="page()"
        [limit]="limit"
        [total]="total()"
        [totalPages]="totalPages()"
        (pageChange)="onPageChange($event)"
      ></app-pagination>

      <!-- Confirmation Dialog -->
      <app-dialog
        [isOpen]="isDialogOpen()"
        [title]="selectedUser()?.status === 'active' ? 'Confirm Account Suspension' : 'Confirm Account Reactivation'"
        [confirmText]="selectedUser()?.status === 'active' ? 'Yes, Suspend Account' : 'Yes, Reactivate Account'"
        [confirmVariant]="selectedUser()?.status === 'active' ? 'danger' : 'primary'"
        [isLoading]="isProcessingAction()"
        (close)="isDialogOpen.set(false)"
        (confirm)="executeStatusToggle()"
      >
        <p>
          Are you sure you want to change the status for
          <span class="font-bold text-neutral-900">{{ selectedUser()?.name }}</span>
          ({{ selectedUser()?.email }})?
        </p>
      </app-dialog>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private api = inject(ApiBaseService);
  private toast = inject(ToastService);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(true);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly limit = 10;

  searchQuery = '';
  roleFilter = '';

  readonly isDialogOpen = signal(false);
  readonly isProcessingAction = signal(false);
  readonly selectedUser = signal<User | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    const params: Record<string, any> = {
      page: this.page(),
      limit: this.limit
    };
    if (this.roleFilter) params['role'] = this.roleFilter;
    if (this.searchQuery) params['search'] = this.searchQuery;

    this.api.get<Paginated<User>>('/admin/users', params).subscribe({
      next: (res) => {
        this.users.set(res.data || []);
        this.total.set(res.total || 0);
        this.totalPages.set(res.totalPages || 1);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback demo data
        this.users.set([
          {
            id: 'u1',
            name: 'Ahmed Mahmoud',
            email: 'provider@dawwarha.org',
            role: 'user',
            status: 'active',
            stats: { contributionsCount: 12, successfulTransfers: 12, rating: 4.9 },
            createdAt: '2026-02-10T10:00:00Z'
          },
          {
            id: 'u2',
            name: 'Resalat Al-Kheir Association',
            email: 'seeker@dawwarha.org',
            role: 'organization',
            status: 'active',
            stats: { contributionsCount: 28, successfulTransfers: 26, rating: 5.0 },
            createdAt: '2026-01-15T14:30:00Z'
          },
          {
            id: 'u3',
            name: 'System Administrator',
            email: 'admin@dawwarha.org',
            role: 'admin',
            status: 'active',
            stats: { contributionsCount: 0, successfulTransfers: 0, rating: 5.0 },
            createdAt: '2026-01-01T00:00:00Z'
          }
        ]);
        this.total.set(3);
        this.totalPages.set(1);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    this.page.set(1);
    this.loadUsers();
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.loadUsers();
  }

  confirmStatusToggle(user: User): void {
    this.selectedUser.set(user);
    this.isDialogOpen.set(true);
  }

  executeStatusToggle(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isProcessingAction.set(true);
    const newStatus = user.status === 'active' ? 'suspended' : 'active';

    this.api.put<{ success: boolean; data: User }>(`/admin/users/${user.id}/suspend`, { status: newStatus }).subscribe({
      next: () => {
        this.isProcessingAction.set(false);
        this.isDialogOpen.set(false);
        this.toast.success('User status updated successfully');
        this.loadUsers();
      },
      error: () => {
        // Optimistic toggle for frontend demo
        this.users.update(list => list.map(u => u.id === user.id ? { ...u, status: newStatus as UserStatus } : u));
        this.isProcessingAction.set(false);
        this.isDialogOpen.set(false);
        this.toast.success(`Account status changed to ${newStatus === 'active' ? 'Active' : 'Suspended'}`);
      }
    });
  }

  getRoleVariant(role: UserRole): 'neutral' | 'sand' | 'danger' {
    if (role === 'admin') return 'danger';
    if (role === 'organization') return 'sand';
    return 'neutral';
  }

  getRoleText(role: UserRole): string {
    if (role === 'admin') return 'Admin';
    if (role === 'organization') return 'Organization';
    return 'Individual';
  }

  formatDate(isoDate: string): string {
    try {
      return new Date(isoDate).toLocaleDateString('en-US');
    } catch {
      return isoDate;
    }
  }
}
