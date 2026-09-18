import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationApiService } from '../notification-api.service';
import { Notification } from '../../../core/models/notification.model';
import { NotificationItemComponent } from '../../../shared/components/notification-item/notification-item.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationItemComponent,
    CardComponent,
    ButtonComponent,
    SkeletonComponent,
    BadgeComponent
  ],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6" dir="rtl">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-neutral-900">التنبيهات والإشعارات</h1>
            @if (unreadCount() > 0) {
              <app-badge variant="info" size="sm">
                {{ unreadCount() }} جديد
              </app-badge>
            }
          </div>
          <p class="text-sm text-neutral-600 mt-1">
            تابع مستجدات المطابقات الذكية، تأكيدات التسليم، وحالة البلاغات والتوثيق.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          @if (unreadCount() > 0) {
            <app-button variant="secondary" size="sm" (clicked)="markAllVisibleAsRead()">
              تحديد الكل كمقروء
            </app-button>
          }
        </div>
      </header>

      <!-- Filter Controls -->
      <div class="flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
        <div class="flex items-center gap-2" role="tablist" aria-label="تصفية الإشعارات">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="!unreadOnlyFilter()"
            (click)="setFilter(false)"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
            [ngClass]="!unreadOnlyFilter() ? 'bg-primary text-white shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
          >
            جميع الإشعارات ({{ notifications().length }})
          </button>

          <button
            type="button"
            role="tab"
            [attr.aria-selected]="unreadOnlyFilter()"
            (click)="setFilter(true)"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
            [ngClass]="unreadOnlyFilter() ? 'bg-primary text-white shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
          >
            غير المقروءة فقط ({{ unreadCount() }})
          </button>
        </div>

        <span class="text-xs text-neutral-400 hidden sm:inline font-mono">
          الأحدث أولاً (Reverse Chronological)
        </span>
      </div>

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="p-4 rounded-xl bg-danger-bg border border-danger/30 text-danger-900 flex items-center justify-between" role="alert">
          <div class="flex items-center gap-2 text-sm">
            <svg class="w-5 h-5 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
          <button
            type="button"
            (click)="loadNotifications()"
            class="text-xs font-semibold text-danger hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      }

      <!-- Loading Skeletons -->
      @if (isLoading()) {
        <div class="flex flex-col gap-3" aria-busy="true" aria-label="جاري تحميل الإشعارات...">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-card padding="md" variant="bordered">
              <div class="flex items-start gap-3">
                <app-skeleton variant="circular" width="40px" height="40px"></app-skeleton>
                <div class="space-y-2 flex-1">
                  <app-skeleton variant="text" width="220px" height="16px"></app-skeleton>
                  <app-skeleton variant="text" width="100%" height="12px"></app-skeleton>
                </div>
              </div>
            </app-card>
          }
        </div>
      } @else if (displayedNotifications().length === 0) {
        <!-- Empty State per DESIGN.md §21 -->
        <app-card padding="lg" variant="bordered">
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-3">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-neutral-900">لا توجد إشعارات حالياً</h3>
            <p class="text-xs text-neutral-500 max-w-sm mt-1 mb-4 leading-relaxed">
              {{ unreadOnlyFilter() ? 'لقد قرأت جميع التنبيهات. لا توجد إشعارات جديدة غير مقروءة.' : 'ستصلك هنا إشعارات فورية عند العثور على مطابقات ذكية أو تأكيد تسليم الموارد.' }}
            </p>
            @if (unreadOnlyFilter()) {
              <app-button variant="secondary" size="sm" (clicked)="setFilter(false)">
                عرض جميع الإشعارات السابقة
              </app-button>
            }
          </div>
        </app-card>
      } @else {
        <!-- Notification Items List -->
        <ul class="flex flex-col gap-3" aria-label="قائمة الإشعارات">
          @for (notification of displayedNotifications(); track notification.id) {
            <app-notification-item
              [notification]="notification"
              (selected)="onNotificationClick($event)"
              (markRead)="onMarkAsRead($event)"
            ></app-notification-item>
          }
        </ul>

        <!-- Pagination Controls -->
        @if (totalPages() > 1) {
          <nav class="flex items-center justify-between border-t border-neutral-200 pt-4 mt-2" aria-label="تنقل بين صفحات الإشعارات">
            <app-button
              variant="outline"
              size="sm"
              [disabled]="currentPage() <= 1"
              (clicked)="changePage(currentPage() - 1)"
            >
              الصفحة السابقة
            </app-button>

            <span class="text-xs text-neutral-500 font-medium font-mono">
              صفحة {{ currentPage() }} من {{ totalPages() }} (إجمالي {{ totalCount() }})
            </span>

            <app-button
              variant="outline"
              size="sm"
              [disabled]="currentPage() >= totalPages()"
              (clicked)="changePage(currentPage() + 1)"
            >
              الصفحة التالية
            </app-button>
          </nav>
        }
      }
    </div>
  `
})
export class NotificationsListComponent implements OnInit {
  private notificationApi = inject(NotificationApiService);
  private router = inject(Router);

  readonly notifications = signal<Notification[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly unreadOnlyFilter = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly totalCount = signal<number>(0);

  readonly unreadCount = computed(() => {
    return this.notifications().filter(n => n.readAt === null || !n.read).length;
  });

  readonly displayedNotifications = computed(() => {
    const list = this.notifications();
    if (this.unreadOnlyFilter()) {
      return list.filter(n => n.readAt === null || !n.read);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.notificationApi.getNotifications({
      page: this.currentPage(),
      limit: 20,
      unreadOnly: this.unreadOnlyFilter()
    }).subscribe({
      next: (res) => {
        // Reverse chronological order
        this.notifications.set(res.notifications);
        if (res.pagination) {
          this.totalPages.set(res.pagination.totalPages || 1);
          this.totalCount.set(res.pagination.total || res.notifications.length);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.message || 'تعذر تحميل الإشعارات من الخادم');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(unreadOnly: boolean): void {
    this.unreadOnlyFilter.set(unreadOnly);
    this.currentPage.set(1);
    this.loadNotifications();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadNotifications();
  }

  onMarkAsRead(notification: Notification): void {
    if (!notification.id) return;

    this.notificationApi.markAsRead(notification.id).subscribe({
      next: (updated) => {
        this.notifications.update(list =>
          list.map(n => n.id === notification.id ? { ...n, read: true, readAt: updated.readAt || new Date().toISOString() } : n)
        );
      },
      error: () => {
        // Optimistic update fallback
        this.notifications.update(list =>
          list.map(n => n.id === notification.id ? { ...n, read: true, readAt: new Date().toISOString() } : n)
        );
      }
    });
  }

  markAllVisibleAsRead(): void {
    const unreadList = this.notifications().filter(n => n.readAt === null || !n.read);
    for (const item of unreadList) {
      this.onMarkAsRead(item);
    }
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read first
    if (notification.readAt === null || !notification.read) {
      this.onMarkAsRead(notification);
    }

    // Navigate to related entity if present
    const rel = notification.relatedEntity;
    if (rel?.type && rel?.id) {
      switch (rel.type) {
        case 'match':
          this.router.navigate(['/matches']);
          break;
        case 'handover':
          this.router.navigate(['/handovers', rel.id]);
          break;
        case 'organization':
          this.router.navigate(['/organizations', rel.id]);
          break;
        case 'report':
          this.router.navigate(['/contributions']);
          break;
        default:
          break;
      }
    }
  }
}
