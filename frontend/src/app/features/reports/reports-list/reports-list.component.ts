import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportApiService } from '../report-api.service';
import { Report } from '../../../core/models/report.model';
import { ReportStatusComponent } from '../../../shared/components/report-status/report-status.component';
import { ReportCreateComponent } from '../report-create/report-create.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReportStatusComponent,
    ReportCreateComponent,
    CardComponent,
    ButtonComponent
  ],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6" dir="rtl">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">سجل البلاغات والشفافية</h1>
          <p class="text-sm text-neutral-600 mt-1">
            متابعة حالة البلاغات التي أرسلتها لمراجعة سلامة الموارد وموثوقية المعاملات.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <app-button variant="danger" size="sm" (clicked)="toggleCreateModal(true)">
            + تقديم بلاغ جديد
          </app-button>
        </div>
      </header>

      <!-- Privacy Notice Banner -->
      <div class="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-3">
        <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="space-y-1">
          <p class="font-semibold text-neutral-800">حماية الخصوصية وحدود الاطلاع (Privacy Boundary)</p>
          <p class="leading-relaxed">
            وفقاً لقواعد الثقة في دَوَّرها (DESIGN.md §25): يحق للمُبلّغ معرفة حالة البلاغ العام فقط (مفتوح / قيد الفحص / تمت المعالجة) دون الاطلاع على أية مذكرات إشرافية داخلية أو تفاصيل حسابات الأطراف الأخرى لضمان سرية التحقيق.
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

      <!-- Contract Gap Alert for User History -->
      @if (reports().length === 0) {
        <app-card padding="lg" variant="bordered">
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <div class="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-neutral-900">لا توجد بلاغات مسجلة في جلستك الحالية</h3>
            <p class="text-xs text-neutral-500 max-w-md mt-1 mb-5 leading-relaxed">
              عند إرسالك لأي بلاغ، سيظهر هنا تتبع فوري لحالته مع رسائل الطمأنة المعتمدة من فريق السلامة المجتمعية.
            </p>
            <app-button variant="secondary" size="sm" (clicked)="toggleCreateModal(true)">
              تقديم بلاغ تجريبي
            </app-button>
          </div>
        </app-card>
      } @else {
        <!-- Reports List -->
        <ul class="flex flex-col gap-3 list-none p-0" aria-label="قائمة بلاغاتي">
          @for (report of reports(); track report.id) {
            <li class="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-neutral-900">
                    بلاغ عن {{ report.targetType === 'resource' ? 'مورد' : report.targetType === 'request' ? 'طلب' : 'مستخدم' }}
                  </span>
                  <span class="text-[11px] font-mono text-neutral-400">#{{ report.id }}</span>
                </div>
                <p class="text-xs text-neutral-600">
                  السبب: <span class="font-semibold">{{ report.reason }}</span>
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
  private reportApi = inject(ReportApiService);

  readonly reports = signal<Report[]>([]);
  readonly showCreateModal = signal<boolean>(false);

  selectedTargetType: 'resource' | 'request' | 'user' = 'resource';
  selectedTargetId: string = '65f1a2b3c4d5e6f7a8b9c0d1';

  ngOnInit(): void {
    this.reportApi.getMyRecentReports().subscribe(list => {
      this.reports.set(list);
    });
  }

  toggleCreateModal(show: boolean): void {
    this.showCreateModal.set(show);
  }

  onReportCreated(report: Report): void {
    this.reports.update(list => [report, ...list]);
  }
}
