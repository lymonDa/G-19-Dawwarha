import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatchApiService } from '../services/match-api.service';
import { ResourceApiService } from '../../resources/resource-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Match, MatchStatus } from '../../../core/models/match.model';
import { Resource } from '../../../core/models/resource.model';
import { MatchCardComponent } from '../../../shared/components/match-card/match-card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatchCardComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <!-- Header Row -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-neutral-900">
              {{ isRtl ? 'المطابقات الذكية والتوصيات' : 'Matches & Recommendations' }}
            </h1>
            <p class="mt-1 text-sm text-neutral-500">
              {{ isRtl ? 'خوارزمية توافق موثوقة تربط الموارد المتوفرة باحتياجات المجتمع الملحة بدقة وشفافية.' : 'Rule-based matches pairing available resources with urgent community demands.' }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <select
              [(ngModel)]="selectedStatus"
              (change)="loadMatches()"
              [title]="isRtl ? 'تصفية حسب الحالة' : 'Filter by status'"
              [attr.aria-label]="isRtl ? 'تصفية حسب الحالة' : 'Filter by status'"
              class="rounded-lg border border-neutral-200 bg-neutral-0 px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
            >
              <option value="">{{ isRtl ? 'جميع الحالات' : 'All Statuses' }}</option>
              <option value="proposed">{{ getStatusLabel('proposed') }}</option>
              <option value="accepted">{{ getStatusLabel('accepted') }}</option>
              <option value="rejected">{{ getStatusLabel('rejected') }}</option>
              <option value="expired">{{ getStatusLabel('expired') }}</option>
            </select>
          </div>
        </div>

        <!-- Match Generation Box (Contextual Resource Selector) -->
        <div class="mt-6 rounded-card border border-neutral-200 bg-neutral-0 p-4 shadow-sm">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-neutral-900">
                  {{ isRtl ? 'إنشاء مطابقات لمورد معين' : 'Generate Matches for a Resource' }}
                </h3>
                <p class="text-xs text-neutral-500">
                  {{ isRtl ? 'اختر أحد الموارد المتاحة لتشغيل خوارزمية المطابقة ذات المعايير الخمسة.' : 'Select an available resource to run the 5-signal matching algorithm.' }}
                </p>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                [(ngModel)]="generateResourceId"
                [title]="isRtl ? 'اختر مورداً متاحاً' : 'Select Available Resource'"
                [attr.aria-label]="isRtl ? 'اختر مورداً متاحاً' : 'Select Available Resource'"
                class="rounded-lg border border-neutral-200 bg-neutral-0 px-3 py-2 text-xs text-neutral-900 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 sm:w-64"
              >
                <option value="">{{ isRtl ? '-- اختر مورداً متاحاً --' : '-- Choose an Available Resource --' }}</option>
                @if (generateResourceId && !isResourceInList(generateResourceId)) {
                  <option [value]="generateResourceId">{{ isRtl ? 'المورد المختار (المعرف: ' + generateResourceId + ')' : ('Selected Resource (ID: ' + generateResourceId + ')') }}</option>
                }
                @for (res of availableResources; track res.id || res._id) {
                  <option [value]="res.id || res._id">
                    {{ res.title }} ({{ isRtl ? 'الكمية:' : 'Qty:' }} {{ res.quantity }})
                  </option>
                }
              </select>

              <button
                type="button"
                (click)="generateMatchesForResource()"
                [disabled]="generatingMatches || !generateResourceId.trim()"
                class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-500 disabled:opacity-50"
              >
                @if (generatingMatches) {
                  <svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>{{ isRtl ? 'جاري التحليل...' : 'Generating...' }}</span>
                } @else {
                  <span>{{ isRtl ? 'تشغيل المطابقة' : 'Run Matching' }}</span>
                }
              </button>
            </div>
          </div>
        </div>

        <!-- Feedback Alerts -->
        @if (successMessage) {
          <div class="mt-4 rounded-card border border-success/30 bg-success-bg p-4 text-sm text-success" role="status">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ successMessage }}</span>
            </div>
          </div>
        }

        @if (errorMessage) {
          <div class="mt-4 rounded-card border border-danger/30 bg-danger-bg p-4 text-sm text-danger" role="alert">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ errorMessage }}</span>
              </div>
              <button
                type="button"
                (click)="loadMatches()"
                class="rounded bg-danger px-2.5 py-1 text-xs font-semibold text-white hover:bg-danger/90"
              >
                {{ isRtl ? 'إعادة المحاولة' : 'Retry' }}
              </button>
            </div>
          </div>
        }

        <!-- Content Area -->
        <div class="mt-6 space-y-5">
          @if (loading) {
            @for (item of [1, 2, 3]; track item) {
              <app-skeleton variant="card" height="220px" />
            }
          } @else if (matches.length === 0) {
            <app-empty-state
              [title]="isRtl ? 'لا توجد مطابقات مطابقة' : 'No matches found'"
              [description]="emptyDescription"
              [actionLabel]="isRtl ? 'تسجيل طلب احتياج' : 'Post a Demand Request'"
              (actionClicked)="navigateToCreateRequest()"
            />
          } @else {
            @for (match of matches; track match._id || match.id) {
              <app-match-card
                [match]="match"
                [loading]="processingId === (match._id || match.id)"
                (accept)="onAccept($event)"
                (reject)="onReject($event)"
              />
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MatchListComponent implements OnInit {
  protected languageService = injectLanguageService();

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  get emptyDescription(): string {
    if (this.selectedStatus) {
      return this.isRtl
        ? `لا توجد مطابقات حالياً بالحالة "${this.getStatusLabel(this.selectedStatus)}".`
        : `There are no matches currently with status "${this.selectedStatus}".`;
    }
    return this.isRtl
      ? 'لم يتم إنشاء مطابقات بعد. يمكنك نشر طلب احتياج أو عرض مورد لتوليد مطابقات فورية.'
      : 'No matches generated yet. Post a demand request or publish a resource to generate transparent matches.';
  }

  matches: Match[] = [];
  availableResources: Resource[] = [];
  selectedStatus: MatchStatus | '' = '';
  loading = true;
  loadingResources = false;
  processingId = '';
  generatingMatches = false;

  successMessage = '';
  errorMessage = '';

  generateResourceId = '';

  private api = inject(MatchApiService);
  private resourceApi = inject(ResourceApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  getStatusLabel(status: string): string {
    return this.languageService?.getStatusLabel(status) || status;
  }

  ngOnInit(): void {
    const paramResId = this.route.snapshot.queryParamMap.get('resourceId');
    if (paramResId) {
      this.generateResourceId = paramResId;
    }
    this.loadAvailableResources();
    this.loadMatches();
  }

  loadAvailableResources(): void {
    this.loadingResources = true;
    this.resourceApi.list({ status: 'available' }).subscribe({
      next: (res) => {
        this.availableResources = res.items || [];
        this.loadingResources = false;
      },
      error: () => {
        this.loadingResources = false;
      }
    });
  }

  isResourceInList(id: string): boolean {
    return this.availableResources.some(r => (r.id || r._id) === id);
  }

  loadMatches(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getAll(this.selectedStatus || undefined).subscribe({
      next: (res) => {
        const items = res.data || [];
        this.matches = items;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل تحميل المطابقات المقترحة.' : 'Failed to load candidate matches.');
      }
    });
  }

  generateMatchesForResource(): void {
    if (!this.generateResourceId.trim()) {
      return;
    }
    this.generatingMatches = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.generate(this.generateResourceId.trim()).subscribe({
      next: (res) => {
        this.generatingMatches = false;
        const count = Array.isArray(res) ? res.length : 0;
        this.successMessage = this.isRtl
          ? `اكتمل تشغيل محرك المطابقة! تم توليد ${count} مطابقة مرشحة.`
          : `Matching engine completed! Generated ${count} candidate match(es).`;
        this.toast.show({
          variant: 'success',
          message: this.successMessage
        });
        this.loadMatches();
      },
      error: (err) => {
        this.generatingMatches = false;
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل توليد مطابقات لهذا المورد.' : 'Failed to generate matches for resource.');
        this.toast.show({
          variant: 'error',
          message: this.errorMessage
        });
      }
    });
  }

  onAccept(match: Match): void {
    const id = match._id || match.id;
    if (!id) return;

    this.processingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.accept(id).subscribe({
      next: () => {
        this.processingId = '';
        this.successMessage = this.isRtl
          ? 'تم قبول المطابقة بنجاح! بدأت مرحلة تنسيق التسليم والتسلم.'
          : 'Match accepted! Handover coordination has been initiated.';
        this.toast.show({
          variant: 'success',
          message: this.successMessage
        });
        this.loadMatches();
      },
      error: (err) => {
        this.processingId = '';
        if (err.status === 409) {
          this.errorMessage = this.isRtl
            ? 'تعارض: هذه المطابقة أو المورد المرتبط بها لم يعد متاحاً.'
            : 'Conflict: this match or associated resource is no longer available.';
        } else if (err.status === 403) {
          this.errorMessage = this.isRtl
            ? 'ليس لديك الصلاحية لقبول هذه المطابقة.'
            : 'You are not authorized to accept this match.';
        } else {
          this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل قبول المطابقة.' : 'Failed to accept match.');
        }
        this.toast.show({
          variant: 'error',
          message: this.errorMessage
        });
      }
    });
  }

  onReject(match: Match): void {
    const id = match._id || match.id;
    if (!id) return;

    this.processingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.reject(id).subscribe({
      next: () => {
        this.processingId = '';
        this.successMessage = this.isRtl
          ? 'تم رفض المطابقة. أصبح المورد متاحاً للمطابقات الأخرى.'
          : 'Match rejected. The resource is now available for other matches.';
        this.toast.show({
          variant: 'info',
          message: this.successMessage
        });
        this.loadMatches();
      },
      error: (err) => {
        this.processingId = '';
        this.errorMessage = err?.error?.message || (this.isRtl ? 'فشل رفض المطابقة.' : 'Failed to reject match.');
        this.toast.show({
          variant: 'error',
          message: this.errorMessage
        });
      }
    });
  }

  navigateToCreateRequest(): void {
    this.router.navigate(['/requests/create']);
  }
}
