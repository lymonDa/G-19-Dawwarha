import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ImpactCardComponent } from '../../../shared/components/impact-card/impact-card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { AdminApiService, AdminAnalyticsData } from '../admin-api.service';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, ImpactCardComponent, SkeletonComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">
            {{ isRtl ? 'المراقبة المباشرة والمؤشرات التحليلية' : 'Live Monitoring & Analytics' }}
          </h1>
          <p class="text-xs text-neutral-500 mt-0.5">
            {{ isRtl
              ? 'مؤشرات الأداء المباشرة وتدفق الموارد عبر مسارات التوزيع والوساطة المجتمعية.'
              : 'Real-time performance indicators and resource flow across all aggregation pipelines.' }}
          </p>
        </div>
        <app-button variant="secondary" size="sm" (click)="loadAnalytics()" [disabled]="isLoading()">
          {{ isRtl ? 'تحديث المؤشرات' : 'Refresh Metrics' }}
        </app-button>
      </div>

      <!-- Error State -->
      @if (error()) {
        <div class="p-4 rounded-xl border border-danger/30 bg-danger-bg text-danger-900 flex items-center justify-between" role="alert">
          <p class="text-xs">{{ error() }}</p>
          <app-button variant="secondary" size="sm" (click)="loadAnalytics()">
            {{ isRtl ? 'إعادة المحاولة' : 'Retry' }}
          </app-button>
        </div>
      }

      <!-- 4 Real-time KPI Cards (Aggregate Neutral Treatment per DESIGN.md §4 & §28) -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-card padding="md" variant="bordered">
              <div class="space-y-2">
                <app-skeleton variant="text" width="60px" height="32px"></app-skeleton>
                <app-skeleton variant="text" width="140px" height="16px"></app-skeleton>
                <app-skeleton variant="text" width="100px" height="12px"></app-skeleton>
              </div>
            </app-card>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-impact-card
            [value]="analytics()?.summary?.resourcesPublished ?? 0"
            [label]="isRtl ? 'إجمالي الموارد المسجلة' : 'Total Registered Resources'"
            [description]="isRtl ? 'موارد فائضة نشطة وجاهزة للتوزيع' : 'Active & ready for circular distribution'"
            variant="aggregate"
            icon="📦"
          ></app-impact-card>

          <app-impact-card
            [value]="analytics()?.summary?.requestsCreated ?? 0"
            [label]="isRtl ? 'طلبات الاحتياج المفتوحة' : 'Open Demand Requests'"
            [description]="isRtl ? 'طلبات مستفيدين نشطة قيد المطابقة' : 'Active seeker requests in pipeline'"
            variant="aggregate"
            icon="📋"
          ></app-impact-card>

          <app-impact-card
            [value]="analytics()?.summary?.completedTransfers ?? 0"
            [label]="isRtl ? 'عمليات التسليم المكتملة' : 'Successful Matches Completed'"
            [description]="isRtl ? 'تسليمات موثقة بتأكيد ثنائي الأطراف' : 'Dual-confirmed & logged transfers'"
            variant="aggregate"
            icon="✓"
          ></app-impact-card>

          <app-impact-card
            [value]="analytics()?.summary?.registeredOrganizations ?? 0"
            [label]="isRtl ? 'المنظمات المعتمدة' : 'Verified Organizations'"
            [description]="isRtl ? 'جمعيات ومؤسسات شريكة موثقة' : 'Registered and verified partner entities'"
            variant="aggregate"
            icon="🏢"
          ></app-impact-card>
        </div>
      }

      <!-- Quick Action Admin Shortcuts -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <app-card padding="md">
          <h3 class="font-bold text-neutral-900 text-sm mb-1">
            {{ isRtl ? 'طابور اعتماد المنظمات' : 'Organization Verification Queue' }}
          </h3>
          <p class="text-xs text-neutral-500 mb-3">
            {{ isRtl
              ? 'مراجعة وثائق الإشهار وتراخيص وزارة التضامن لمنح شارات التوثيق الرسمية.'
              : 'Review registration documents and ministry licenses to grant verification badges.' }}
          </p>
          <a routerLink="/admin/organizations">
            <app-button variant="primary" size="sm" [fullWidth]="true">
              {{ isRtl ? 'فحص المنظمات والوثائق' : 'Review Organizations' }}
            </app-button>
          </a>
        </app-card>

        <app-card padding="md">
          <h3 class="font-bold text-neutral-900 text-sm mb-1">
            {{ isRtl ? 'إدارة المستخدمين والحسابات' : 'User & Account Management' }}
          </h3>
          <p class="text-xs text-neutral-500 mb-3">
            {{ isRtl
              ? 'إدارة صلاحيات الأدوار ومراقبة الحسابات المعلقة بسبب مخالفة سياسات المنصة.'
              : 'Manage roles and monitor suspended or flagged accounts for policy violations.' }}
          </p>
          <a routerLink="/admin/users">
            <app-button variant="secondary" size="sm" [fullWidth]="true">
              {{ isRtl ? 'فتح جدول المستخدمين' : 'Open Users Table' }}
            </app-button>
          </a>
        </app-card>

        <app-card padding="md">
          <h3 class="font-bold text-neutral-900 text-sm mb-1">
            {{ isRtl ? 'التصنيفات وإدارة النزاعات' : 'Categories & Moderation' }}
          </h3>
          <p class="text-xs text-neutral-500 mb-3">
            {{ isRtl
              ? 'إدارة شجرة تصنيفات الموارد ومعالجة بلاغات عدم الحضور والمخالفات.'
              : 'Manage the resource taxonomy tree and resolve flagged disputes and complaints.' }}
          </p>
          <a routerLink="/admin/categories">
            <app-button variant="secondary" size="sm" [fullWidth]="true">
              {{ isRtl ? 'تعديل التصنيفات' : 'Edit Categories' }}
            </app-button>
          </a>
        </app-card>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  protected languageService = injectLanguageService();
  private adminApi = inject(AdminApiService);

  readonly analytics = signal<AdminAnalyticsData | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.adminApi.getAnalytics().subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || (this.isRtl ? 'تعذر تحميل مؤشرات المنصة المباشرة' : 'Failed to load live metrics'));
        this.isLoading.set(false);
      }
    });
  }
}

