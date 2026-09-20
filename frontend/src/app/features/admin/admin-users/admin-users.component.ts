import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';
import { User, UserRole } from '../../../core/models/user.model';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SearchComponent } from '../../../shared/ui/search/search.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    PaginationComponent,
    BadgeComponent,
    ButtonComponent,
    DialogComponent,
    SkeletonComponent,
    SearchComponent,
    SelectComponent
  ],
  template: `
    <div class="flex flex-col gap-6" [dir]="lang.direction()">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">{{ lang.t().ADMIN_USERS_TITLE }}</h1>
          <p class="text-xs text-neutral-500 mt-0.5">{{ lang.t().ADMIN_USERS_SUBTITLE }}</p>
        </div>

        <!-- Filters Bar -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <div class="w-full sm:w-60">
            <app-search
              [placeholder]="lang.t().ADMIN_SEARCH_USERS_PLACEHOLDER"
              [(ngModel)]="searchQuery"
              (search)="onSearchChange()"
              (cleared)="onSearchChange()"
            ></app-search>
          </div>

          <div class="w-full sm:w-44">
            <app-select
              [options]="roleOptions()"
              [(ngModel)]="roleFilter"
              (ngModelChange)="onRoleFilterChange()"
            ></app-select>
          </div>
        </div>
      </div>

      <!-- Users Data Table -->
      <app-table>
        <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'المستخدم' : 'User' }}</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'الدور' : 'Role' }}</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'الحالة' : 'Status' }}</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'المساهمات' : 'Contributions' }}</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'تاريخ الانضمام' : 'Joined' }}</th>
            <th class="px-4 py-3 text-end text-xs font-semibold">{{ isRtl ? 'الإجراءات' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          @if (isLoading()) {
            <tr>
              <td colspan="6" class="p-6 text-center">
                <app-skeleton variant="rectangular"></app-skeleton>
              </td>
            </tr>
          } @else if (errorMessage()) {
            <!-- Error State with Retry (No Fake Fallback Data) -->
            <tr>
              <td colspan="6" class="py-8 text-center">
                <div class="flex flex-col items-center gap-2 text-xs text-danger-900">
                  <span class="font-medium">{{ errorMessage() }}</span>
                  <app-button variant="secondary" size="sm" (clicked)="loadUsers()">
                    {{ lang.t().ADMIN_RETRY }}
                  </app-button>
                </div>
              </td>
            </tr>
          } @else if (users().length === 0) {
            <tr>
              <td colspan="6" class="py-8 text-center text-xs text-neutral-500">
                {{ lang.t().ADMIN_NO_USERS }}
              </td>
            </tr>
          } @else {
            @for (user of users(); track user.id) {
              <tr class="hover:bg-neutral-50/80 transition-colors">
                <!-- Name & Email -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {{ user.name ? user.name.charAt(0) : 'U' }}
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
                    {{ user.status === 'active' ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'موقوف' : 'Suspended') }}
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
                      {{ user.status === 'active'
                        ? (isRtl ? 'إيقاف الحساب' : 'Suspend Account')
                        : (isRtl ? 'إعادة التنشيط' : 'Reactivate') }}
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
        [title]="selectedUser()?.status === 'active'
          ? (isRtl ? 'تأكيد إيقاف الحساب' : 'Confirm Account Suspension')
          : (isRtl ? 'تأكيد إعادة تنشيط الحساب' : 'Confirm Account Reactivation')"
        [confirmText]="selectedUser()?.status === 'active'
          ? (isRtl ? 'نعم، أوقف الحساب' : 'Yes, Suspend Account')
          : (isRtl ? 'نعم، أعد التنشيط' : 'Yes, Reactivate Account')"
        [cancelText]="isRtl ? 'إلغاء' : 'Cancel'"
        [confirmVariant]="selectedUser()?.status === 'active' ? 'danger' : 'primary'"
        [isLoading]="isProcessingAction()"
        (close)="isDialogOpen.set(false)"
        (confirm)="executeStatusToggle()"
      >
        <p>
          {{ isRtl ? 'هل أنت متأكد من تغيير حالة حساب' : 'Are you sure you want to change the status for' }}
          <span class="font-bold text-neutral-900">{{ selectedUser()?.name }}</span>
          ({{ selectedUser()?.email }})؟
        </p>
      </app-dialog>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private adminApi = inject(AdminApiService);
  private toast = inject(ToastService);
  readonly lang = inject(LanguageService);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly limit = 10;

  searchQuery = '';
  roleFilter = '';

  get isRtl(): boolean {
    return this.lang.isRtl();
  }

  readonly roleOptions = computed<SelectOption[]>(() => {
    const rtl = this.isRtl;
    return [
      { value: '', label: rtl ? 'جميع الأدوار' : 'All Roles' },
      { value: 'user', label: rtl ? 'أفراد' : 'Individuals' },
      { value: 'admin', label: rtl ? 'مشرفون' : 'Admins' }
    ];
  });

  readonly isDialogOpen = signal(false);
  readonly isProcessingAction = signal(false);
  readonly selectedUser = signal<User | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  onRoleFilterChange(): void {
    this.page.set(1);
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminApi.getUsers({
      page: this.page(),
      limit: this.limit,
      role: this.roleFilter || undefined,
      search: this.searchQuery || undefined
    }).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.users.set([]);
        this.total.set(0);
        this.totalPages.set(1);
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || (this.isRtl ? 'تعذر جلب قائمة المستخدمين' : 'Failed to fetch users list'));
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
    const isSuspending = user.status === 'active';
    const action$ = isSuspending
      ? this.adminApi.suspendUser(user.id)
      : this.adminApi.reactivateUser(user.id);

    action$.subscribe({
      next: () => {
        this.isProcessingAction.set(false);
        this.isDialogOpen.set(false);
        this.toast.success(
          isSuspending
            ? (this.isRtl ? 'تم إيقاف الحساب بنجاح' : 'User suspended successfully')
            : (this.isRtl ? 'تمت إعادة تنشيط الحساب بنجاح' : 'User reactivated successfully')
        );
        this.loadUsers();
      },
      error: (err) => {
        this.isProcessingAction.set(false);
        this.isDialogOpen.set(false);
        this.toast.error(err?.message || (this.isRtl ? 'تعذر تحديث حالة المستخدم' : 'Failed to update user status'));
      }
    });
  }

  getRoleVariant(role: UserRole): 'neutral' | 'danger' {
    if (role === 'admin') return 'danger';
    return 'neutral';
  }

  getRoleText(role: UserRole): string {
    if (role === 'admin') return this.isRtl ? 'مشرف' : 'Admin';
    return this.isRtl ? 'فرد' : 'Individual';
  }

  formatDate(isoDate: string): string {
    try {
      return new Date(isoDate).toLocaleDateString(this.isRtl ? 'ar-EG' : 'en-US');
    } catch {
      return isoDate;
    }
  }
}

