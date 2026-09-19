import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ReportApiService } from '../../reports/report-api.service';
import { Report, ReportStatus } from '../../../core/models/report.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    BadgeComponent,
    ButtonComponent,
    DialogComponent,
    EmptyStateComponent,
    SkeletonComponent
  ],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Reports & Dispute Management</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Resolve complaints of no-show or resource mismatch from the listed specifications.</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Status Filter Pills -->
          <div class="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-1 text-xs">
            <button
              type="button"
              (click)="setFilter('all')"
              class="px-2.5 py-1 rounded-md transition-colors font-medium"
              [ngClass]="activeFilter() === 'all' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'"
            >
              All
            </button>
            <button
              type="button"
              (click)="setFilter('open')"
              class="px-2.5 py-1 rounded-md transition-colors font-medium"
              [ngClass]="activeFilter() === 'open' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'"
            >
              Open
            </button>
            <button
              type="button"
              (click)="setFilter('reviewed')"
              class="px-2.5 py-1 rounded-md transition-colors font-medium"
              [ngClass]="activeFilter() === 'reviewed' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'"
            >
              Reviewed
            </button>
            <button
              type="button"
              (click)="setFilter('resolved')"
              class="px-2.5 py-1 rounded-md transition-colors font-medium"
              [ngClass]="activeFilter() === 'resolved' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'"
            >
              Resolved
            </button>
          </div>

          <app-button variant="secondary" size="sm" (click)="loadReports()" [disabled]="isLoading()">
            Refresh
          </app-button>
        </div>
      </div>

      <!-- Error State -->
      @if (error()) {
        <div class="p-4 rounded-xl border border-danger/30 bg-danger-bg text-danger-900 flex items-center justify-between" role="alert">
          <p class="text-xs">{{ error() }}</p>
          <app-button variant="secondary" size="sm" (click)="loadReports()">Retry</app-button>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="space-y-2">
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
        </div>
      } @else if (reports().length === 0) {
        <app-empty-state
          title="No Reports Found"
          description="There are currently no reports matching the selected filter."
        ></app-empty-state>
      } @else {
        <app-table>
          <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
            <tr>
              <th class="px-4 py-3 text-start text-xs font-semibold">Report ID</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">Entity Type</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">Reason</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">Status</th>
              <th class="px-4 py-3 text-end text-xs font-semibold">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 text-xs">
            @for (report of reports(); track report.id) {
              <tr class="hover:bg-neutral-50/80">
                <td class="px-4 py-3 font-mono font-bold text-neutral-900">#{{ report.id.substring(0, 8) }}</td>
                <td class="px-4 py-3 text-neutral-600 capitalize">{{ report.targetType }}</td>
                <td class="px-4 py-3 text-neutral-700 max-w-xs truncate">{{ report.reason }}: {{ report.description || 'No description provided' }}</td>
                <td class="px-4 py-3">
                  <app-badge [variant]="getStatusVariant(report.status)" size="sm">
                    {{ getStatusLabel(report.status) }}
                  </app-badge>
                </td>
                <td class="px-4 py-3 text-end">
                  <app-button
                    [variant]="report.status === 'resolved' ? 'ghost' : 'secondary'"
                    size="sm"
                    (click)="openResolutionDialog(report)"
                  >
                    {{ report.status === 'resolved' ? 'View Details' : 'Handle Report' }}
                  </app-button>
                </td>
              </tr>
            }
          </tbody>
        </app-table>
      }

      <!-- Report Resolution Dialog -->
      <app-dialog
        [isOpen]="isDialogOpen()"
        [title]="activeReport()?.status === 'resolved' ? 'Report Details & Resolution' : 'Resolve Report'"
        (close)="closeDialog()"
      >
        @if (activeReport(); as report) {
          <div class="flex flex-col gap-4 text-xs">
            <div class="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <div>
                <span class="text-neutral-500">Report ID:</span>
                <p class="font-mono font-bold text-neutral-900">{{ report.id }}</p>
              </div>
              <div>
                <span class="text-neutral-500">Target Type:</span>
                <p class="font-semibold text-neutral-900 capitalize">{{ report.targetType }}</p>
              </div>
              <div>
                <span class="text-neutral-500">Target ID:</span>
                <p class="font-mono text-neutral-700">{{ report.targetId }}</p>
              </div>
              <div>
                <span class="text-neutral-500">Reason:</span>
                <p class="font-semibold text-neutral-900 capitalize">{{ report.reason }}</p>
              </div>
              @if (report.description) {
                <div class="col-span-2 mt-1">
                  <span class="text-neutral-500">Reporter Description:</span>
                  <p class="text-neutral-800 mt-0.5 whitespace-pre-wrap">{{ report.description }}</p>
                </div>
              }
            </div>

            @if (report.status === 'resolved' || report.resolution) {
              <div class="p-3 bg-success-bg border border-success/30 rounded-lg">
                <span class="font-semibold text-success-800">Resolution Notes:</span>
                <p class="text-success-900 mt-1 whitespace-pre-wrap">{{ report.resolution || report.resolutionNotes }}</p>
                @if (report.reviewedBy || report.resolvedBy) {
                  <p class="text-neutral-500 text-[10px] mt-2">Resolved by Admin #{{ report.reviewedBy || report.resolvedBy }}</p>
                }
              </div>
            } @else {
              <!-- Resolution Form -->
              <div class="flex flex-col gap-3">
                <div>
                  <label for="resolutionNotes" class="block font-medium text-neutral-700 mb-1">Resolution Notes *</label>
                  <textarea
                    id="resolutionNotes"
                    rows="3"
                    [(ngModel)]="resolutionNotes"
                    placeholder="Enter detailed resolution notes regarding the investigation and decision taken..."
                    class="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                </div>

                <div>
                  <label class="block font-medium text-neutral-700 mb-1">Resolution Outcome</label>
                  <div class="flex items-center gap-4">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="resStatus" value="resolved" [(ngModel)]="resolutionStatus" class="text-primary focus:ring-primary">
                      <span>Resolved (Mark Closed)</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="resStatus" value="reviewed" [(ngModel)]="resolutionStatus" class="text-primary focus:ring-primary">
                      <span>Reviewed (Requires Monitoring)</span>
                    </label>
                  </div>
                </div>

                @if (dialogError()) {
                  <div class="p-2 rounded bg-danger-bg text-danger text-[11px]" role="alert">
                    {{ dialogError() }}
                  </div>
                }

                <div class="flex justify-end gap-2 mt-2 pt-3 border-t border-neutral-100">
                  <app-button variant="ghost" size="sm" (click)="closeDialog()" [disabled]="isSubmitting()">
                    Cancel
                  </app-button>
                  <app-button
                    variant="primary"
                    size="sm"
                    (click)="submitResolution()"
                    [disabled]="isSubmitting() || !resolutionNotes.trim()"
                  >
                    {{ isSubmitting() ? 'Submitting...' : 'Submit Resolution' }}
                  </app-button>
                </div>
              </div>
            }
          </div>
        }
      </app-dialog>
    </div>
  `
})
export class AdminReportsComponent implements OnInit {
  private reportApi = inject(ReportApiService);
  private toast = inject(ToastService);

  readonly reports = signal<Report[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly activeFilter = signal<'all' | 'open' | 'reviewed' | 'resolved'>('all');

  // Dialog State
  readonly isDialogOpen = signal<boolean>(false);
  readonly activeReport = signal<Report | null>(null);
  readonly dialogError = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  resolutionNotes = '';
  resolutionStatus: 'reviewed' | 'resolved' = 'resolved';

  ngOnInit(): void {
    this.loadReports();
  }

  setFilter(filter: 'all' | 'open' | 'reviewed' | 'resolved'): void {
    this.activeFilter.set(filter);
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: Record<string, any> = {};
    if (this.activeFilter() !== 'all') {
      params['status'] = this.activeFilter();
    }

    this.reportApi.listReportsForAdmin(params).subscribe({
      next: (res) => {
        this.reports.set(res.reports || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load reports');
        this.isLoading.set(false);
      }
    });
  }

  openResolutionDialog(report: Report): void {
    this.activeReport.set(report);
    this.resolutionNotes = report.resolution || report.resolutionNotes || '';
    this.resolutionStatus = report.status === 'reviewed' ? 'reviewed' : 'resolved';
    this.dialogError.set(null);
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.activeReport.set(null);
    this.dialogError.set(null);
    this.resolutionNotes = '';
  }

  submitResolution(): void {
    const report = this.activeReport();
    if (!report) return;

    if (!this.resolutionNotes.trim()) {
      this.dialogError.set('Resolution notes are required.');
      return;
    }

    this.isSubmitting.set(true);
    this.dialogError.set(null);

    this.reportApi.resolveReport(report.id, {
      resolution: this.resolutionNotes.trim(),
      status: this.resolutionStatus
    }).subscribe({
      next: (updated) => {
        this.isSubmitting.set(false);
        this.toast.success('Report resolved successfully');

        // Update local list
        this.reports.update(list => list.map(r => r.id === updated.id ? { ...r, ...updated } : r));

        this.closeDialog();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.dialogError.set(err?.message || 'Failed to submit resolution');
      }
    });
  }

  getStatusVariant(status: ReportStatus): 'danger' | 'warning' | 'success' | 'neutral' {
    switch (status) {
      case 'open':
        return 'danger';
      case 'reviewed':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'neutral';
    }
  }

  getStatusLabel(status: ReportStatus): string {
    switch (status) {
      case 'open':
        return 'Open — Needs Review';
      case 'reviewed':
        return 'Under Review';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  }
}
