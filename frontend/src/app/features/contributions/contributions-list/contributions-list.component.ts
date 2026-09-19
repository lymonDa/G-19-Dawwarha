import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContributionApiService } from '../contribution-api.service';
import { Contribution } from '../../../core/models/contribution.model';
import { AuthService } from '../../../core/auth/auth.service';
import { ContributionCardComponent } from '../../../shared/components/contribution-card/contribution-card.component';
import { ImpactCardComponent } from '../../../shared/components/impact-card/impact-card.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

export type ContributionFilter = 'all' | 'given' | 'received';

@Component({
  selector: 'app-contributions-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ContributionCardComponent,
    ImpactCardComponent,
    CardComponent,
    ButtonComponent
  ],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      <!-- Page Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">سجل الأثر والمساهمات المجتمعية</h1>
          <p class="text-sm text-neutral-600 mt-1">
            سجل غير مالي توثيقي لعمليات التدوير المكتملة والموارد الحضرية المستعادة بنجاح.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <a routerLink="/resources">
            <app-button variant="primary" size="sm">
              + تبرع بمورد جديد
            </app-button>
          </a>
        </div>
      </header>

      <!-- 1. Impact Summary (Warm Sand Accent per DESIGN.md §4 & §13) -->
      <section aria-label="ملخص مؤشرات الأثر الشخصي">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Metric 1: Total Completed Handovers -->
          <app-impact-card
            [value]="totalCompletedCount()"
            label="إجمالي المعاملات المكتملة"
            description="عمليات تسليم ثنائية موثقة"
            variant="personal"
            icon="★"
            [isLoading]="isLoading()"
          ></app-impact-card>

          <!-- Metric 2: Resources Rescued / Given -->
          <app-impact-card
            [value]="givenCount()"
            label="موارد تم التبرع بها (Given)"
            description="أصول تم إنقاذها وإعادة استخدامها"
            variant="personal"
            icon="↑"
            [isLoading]="isLoading()"
          ></app-impact-card>

          <!-- Metric 3: Requests Fulfilled / Received -->
          <app-impact-card
            [value]="receivedCount()"
            label="احتياجات تمت تلبيتها (Received)"
            description="مستلزمات وصلت لمستحقيها"
            variant="personal"
            icon="↓"
            [isLoading]="isLoading()"
          ></app-impact-card>
        </div>
      </section>

      <!-- 2. Controls & Filter Bar -->
      <div class="flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
        <div class="flex items-center gap-2" role="tablist" aria-label="تصفية المساهمات">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeFilter() === 'all'"
            (click)="setFilter('all')"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
            [ngClass]="activeFilter() === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
          >
            الكل ({{ contributions().length }})
          </button>

          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeFilter() === 'given'"
            (click)="setFilter('given')"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
            [ngClass]="activeFilter() === 'given' ? 'bg-primary text-white shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
          >
            الموارد الممنوحة ({{ givenCount() }})
          </button>

          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeFilter() === 'received'"
            (click)="setFilter('received')"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
            [ngClass]="activeFilter() === 'received' ? 'bg-primary text-white shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
          >
            الاحتياجات المستلمة ({{ receivedCount() }})
          </button>
        </div>

        <span class="text-xs text-neutral-400 hidden sm:inline font-mono">
          الترتيب: الأحدث أولاً (Reverse Chronological)
        </span>
      </div>

      <!-- 3. Error Banner State -->
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
            (click)="loadContributions()"
            class="text-xs font-semibold text-danger hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      }

      <!-- 4. Loading Skeletons -->
      @if (isLoading()) {
        <ul class="flex flex-col gap-3" aria-busy="true" aria-label="جاري تحميل السجل...">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-contribution-card [isLoading]="true"></app-contribution-card>
          }
        </ul>
      } @else if (filteredContributions().length === 0) {
        <!-- 5. Empty State per DESIGN.md §21 -->
        <app-card padding="lg" variant="bordered">
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <div class="w-14 h-14 rounded-full bg-sand-100 text-sand-700 flex items-center justify-center text-2xl mb-3 shadow-xs">
              ★
            </div>
            <h3 class="text-base font-bold text-neutral-900">لا توجد مساهمات مسجلة في هذا القسم بعد</h3>
            <p class="text-xs text-neutral-500 max-w-sm mt-1 mb-5 leading-relaxed">
              عند إتمام أي عملية تسليم واستلام عبر بروتوكول التأكيد الثنائي، يتم توثيق المساهمة فوراً وإضافتها إلى هذا السجل الدائم.
            </p>
            <div class="flex items-center gap-3">
              <a routerLink="/resources">
                <app-button variant="primary" size="sm">
                  تصفح الموارد المتاحة
                </app-button>
              </a>
              <a routerLink="/requests">
                <app-button variant="secondary" size="sm">
                  استعراض طلبات الاحتياج
                </app-button>
              </a>
            </div>
          </div>
        </app-card>
      } @else {
        <!-- 6. Populated Reverse-Chronological List -->
        <ul class="flex flex-col gap-3" aria-label="قائمة المساهمات المكتملة">
          @for (contribution of filteredContributions(); track contribution.id) {
            <app-contribution-card
              [contribution]="contribution"
              [role]="resolveRole(contribution)"
            ></app-contribution-card>
          }
        </ul>
      }
    </div>
  `
})
export class ContributionsListComponent implements OnInit {
  private contributionApi = inject(ContributionApiService);
  private authService = inject(AuthService);

  readonly contributions = signal<Contribution[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly activeFilter = signal<ContributionFilter>('all');

  readonly currentUserId = computed(() => this.authService.currentUser()?.id || '');

  readonly givenCount = computed(() => {
    return this.contributions().filter(c => this.resolveRole(c) === 'provider').length;
  });

  readonly receivedCount = computed(() => {
    return this.contributions().filter(c => this.resolveRole(c) === 'seeker').length;
  });

  readonly totalCompletedCount = computed(() => this.contributions().length);

  readonly filteredContributions = computed(() => {
    const list = this.contributions();
    const filter = this.activeFilter();

    if (filter === 'given') {
      return list.filter(c => this.resolveRole(c) === 'provider');
    }
    if (filter === 'received') {
      return list.filter(c => this.resolveRole(c) === 'seeker');
    }
    return list;
  });

  ngOnInit(): void {
    this.loadContributions();
  }

  loadContributions(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.contributionApi.getMyContributions({ page: 1, limit: 50 }).subscribe({
      next: (res) => {
        // Backend returns contributions sorted by createdAt: -1 (reverse chronological)
        this.contributions.set(res.contributions);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.message || 'تعذر تحميل سجل المساهمات');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: ContributionFilter): void {
    this.activeFilter.set(filter);
  }

  resolveRole(contribution: Contribution): 'provider' | 'seeker' {
    if (contribution.role) {
      return contribution.role;
    }
    const myId = this.currentUserId();
    if (myId && contribution.providerId === myId) {
      return 'provider';
    }
    if (myId && contribution.seekerId === myId) {
      return 'seeker';
    }
    return 'provider';
  }
}
