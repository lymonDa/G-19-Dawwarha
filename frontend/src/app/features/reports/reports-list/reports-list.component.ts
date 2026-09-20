import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportApiService } from '../report-api.service';
import { Report } from '../../../core/models/report.model';
import { ReportStatusComponent } from '../../../shared/components/report-status/report-status.component';
import { ReportCreateComponent } from '../report-create/report-create.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReportStatusComponent,
    ReportCreateComponent,
    CardComponent,
    ButtonComponent,
    SkeletonComponent
  ],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">
            {{ isRtl ? 'سجل البلاغات والشفافية' : 'Reports & Transparency Ledger' }}
          </h1>
          <p class="text-sm text-neutral-600 mt-1">
            {{ isRtl ? 'متابعة حالة البلاغات التي أرسلتها لمراجعة سلامة الموارد وموثوقية المعاملات.' : 'Track the status of reports submitted regarding resource safety and exchange integrity.' }}
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <app-button variant="danger" size="sm" (clicked)="toggleCreateModal(true)">
            {{ isRtl ? '+ تقديم بلاغ جديد' : '+ Submit New Report' }}
          </app-button>
        </div>
      </header>

      <!-- Privacy Notice Banner -->
      <div class="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-3">
        <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="space-y-1">
          <p class="font-semibold text-neutral-800">
            {{ isRtl ? 'حماية الخصوصية وحدود الاطلاع (Privacy Boundary)' : 'Privacy Protection & Moderation Boundary' }}
          </p>
          <p class="leading-relaxed">
            {{ isRtl
              ? 'وفقاً لقواعد الثقة في دَوَّرها (DESIGN.md §25): يحق للمُبلّغ معرفة حالة البلاغ العام فقط (مفتوح / قيد الفحص / تمت المعالجة) دون الاطلاع على أية مذكرات إشرافية داخلية أو تفاصيل حسابات الأطراف الأخرى لضمان سرية التحقيق.'
              : 'Per Dawwarha trust guidelines (DESIGN.md §25): Reporters can view high-level status (Open / In Review / Resolved) without exposure to internal moderator notes.' }}
          </p>
        </div>
      </div>

      <!-- Report Creation Dialog / Form if active -->
      @if (showCreateModal()) {
        <div class="my-2 p-4 rounded-2xl bg-neutral-100/70 border border-neutral-300">
          <app-report-create
            [targetType]="selectedTargetType"
            [targetId]="selectedTargetId"
            (completed)="onReportCreated($event)"
            (cancelled)="toggleCreateModal(false)"
          ></app-report-create>
        </div>
      }

      <!-- Error State Banner -->
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
            (click)="loadReports()"
            class="text-xs font-semibold text-danger hover:underline"
          >
            {{ isRtl ? 'إعادة المحاولة' : 'Retry' }}
          </button>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex flex-col gap-3" aria-busy="true" [attr.aria-label]="isRtl ? 'جاري تحميل سجل البلاغات...' : 'Loading reports...'">
          @for (i of [1, 2, 3]; track i) {
            <div class="p-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-between gap-3">
              <div class="space-y-2 flex-1">
                <app-skeleton variant="text" width="180px" height="16px"></app-skeleton>
                <app-skeleton variant="text" width="260px" height="12px"></app-skeleton>
              </div>
              <app-skeleton variant="rectangular" width="90px" height="24px"></app-skeleton>
            </div>
          }
        </div>
      } @else if (reports().length === 0) {
        <!-- Empty State -->
        <app-card padding="lg" variant="bordered">
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <div class="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-neutral-900">
              {{ isRtl ? 'لا توجد بلاغات مسجلة بحسابك حتى الآن' : 'No reports recorded on your account yet' }}
            </h3>
            <p class="text-xs text-neutral-500 max-w-md mt-1 mb-5 leading-relaxed">
              {{ isRtl ? 'جميع البلاغات التي ترسلها لمراجعة سلامة الموارد أو المعاملات يتم تسجيلها وحفظها هنا مع تحديثات الإشراف الفورية.' : 'All reports you submit for review are safely recorded here with real-time moderation status updates.' }}
            </p>
            <app-button variant="secondary" size="sm" (clicked)="toggleCreateModal(true)">
              {{ isRtl ? 'تقديم بلاغ تجريبي' : 'Submit a Demo Report' }}
            </app-button>
          </div>
        </app-card>
      } @else {
        <!-- Reports List -->
        <ul class="flex flex-col gap-3 list-none p-0" [attr.aria-label]="isRtl ? 'قائمة بلاغاتي' : 'My reports list'">
          @for (report of reports(); track report.id) {
            <li class="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-neutral-900">
                    {{ isRtl ? ('بلاغ عن ' + (report.targetType === 'resource' ? 'مورد' : report.targetType === 'request' ? 'طلب' : 'مستخدم')) : ('Report for ' + (report.targetType === 'resource' ? 'Resource' : report.targetType === 'request' ? 'Request' : 'User')) }}
                  </span>
                  <span class="text-[11px] font-mono text-neutral-400">#{{ report.id }}</span>
                </div>
                <p class="text-xs text-neutral-600">
                  {{ isRtl ? 'السبب:' : 'Reason:' }} <span class="font-semibold">{{ report.reason }}</span>
                  @if (report.description) {
                    — <span class="italic text-neutral-500">"{{ report.description }}"</span>
                  }
                </p>
              </div>

              <div class="pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <app-report-status
                  [status]="report.status"
                  [timestamp]="report.createdAt"
                  [isReporterFacing]="true"
                ></app-report-status>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `
})
export class ReportsListComponent implements OnInit {
  protected languageService = injectLanguageService();

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  private reportApi = inject(ReportApiService);

  readonly reports = signal<Report[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showCreateModal = signal<boolean>(false);

  selectedTargetType: 'resource' | 'request' | 'user' = 'resource';
  selectedTargetId: string = '65f1a2b3c4d5e6f7a8b9c0d1';

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.reportApi.getMyReports({ page: 1, limit: 50 }).subscribe({
      next: (res) => {
        this.reports.set(res.reports);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.message || (this.isRtl ? 'تعذر تحميل سجل البلاغات من الخادم' : 'Failed to load reports from server'));
        this.isLoading.set(false);
      }
    });
  }

  toggleCreateModal(show: boolean): void {
    this.showCreateModal.set(show);
  }

  onReportCreated(report: Report): void {
    this.reports.update(list => [report, ...list]);
    this.showCreateModal.set(false);
  }
}
