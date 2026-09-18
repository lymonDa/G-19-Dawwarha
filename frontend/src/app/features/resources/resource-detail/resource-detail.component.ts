import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ResourceApiService } from '../resource-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Resource, ResourceLifecycleAction, ResourceStatus } from '../../../core/models/resource.model';
import { LifecycleTimelineComponent, LifecycleStepId } from '../../../shared/components/lifecycle-timeline/lifecycle-timeline.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LifecycleTimelineComponent,
    CardComponent,
    ButtonComponent,
    SkeletonComponent,
    DialogComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl flex flex-col gap-6">
        <!-- Breadcrumbs Navigation -->
        <a
          routerLink="/resources"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Resources</span>
        </a>

        <!-- Loading Skeleton -->
        @if (isLoading()) {
          <div class="space-y-4">
            <app-skeleton variant="card" height="140px"></app-skeleton>
            <app-skeleton variant="card" height="260px"></app-skeleton>
          </div>
        } @else if (errorMessage()) {
          <!-- Error State -->
          <div class="rounded-card border border-danger/30 bg-danger-bg p-6 text-sm text-danger flex items-center justify-between" role="alert">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
            <a routerLink="/resources">
              <app-button variant="outline" size="sm">Return to Resources</app-button>
            </a>
          </div>
        } @else if (resource()) {
          <!-- Main Resource Card -->
          <app-card padding="lg">
            <!-- Header Row -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100">
              <div>
                <span class="inline-block text-xs font-bold text-primary bg-primary-50 px-2.5 py-1 rounded">
                  {{ categoryName }}
                </span>
                <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 mt-2">
                  {{ resource()!.title }}
                </h1>
                <p class="text-xs text-neutral-500 mt-1">
                  {{ locationText }} · Listed {{ formattedCreatedDate }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize"
                  [ngClass]="statusBadgeClass"
                >
                  {{ statusLabel }}
                </span>
              </div>
            </div>

            <!-- Lifecycle Timeline Progress -->
            <div class="my-6 p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/60">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
                Redistribution Lifecycle Stage
              </h2>
              <app-lifecycle-timeline
                [currentStep]="timelineStep()"
                [terminalState]="terminalState()"
                [cancelledAtStep]="cancelledStep()"
              ></app-lifecycle-timeline>
            </div>

            <!-- Description -->
            <div class="py-4 border-y border-neutral-100 my-4 text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
              {{ resource()!.description }}
            </div>

            <!-- Detailed Specifications Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-600 mb-6">
              <div>
                <span class="text-neutral-400 block font-medium">Available Quantity</span>
                <span class="font-bold text-neutral-900 text-sm mt-0.5 block">
                  {{ resource()!.quantity }} items
                </span>
              </div>

              <div>
                <span class="text-neutral-400 block font-medium">Collection Window</span>
                <span class="font-bold text-neutral-900 text-sm mt-0.5 block">
                  {{ availabilityWindowText }}
                </span>
              </div>

              <div>
                <span class="text-neutral-400 block font-medium">City & Area</span>
                <span class="font-bold text-neutral-900 text-sm mt-0.5 block">
                  {{ locationText }}
                </span>
              </div>

              <div>
                <span class="text-neutral-400 block font-medium">Lifecycle Action</span>
                <span class="font-bold text-sm mt-0.5 block" [ngClass]="statusLabelColor">
                  {{ statusLabel }}
                </span>
              </div>
            </div>

            <!-- Safety Disclosure Section (if available) -->
            @if (resource()!.safetyDisclosure) {
              <div class="mb-6 p-4 rounded-lg bg-info-bg border border-info/20 text-xs text-info leading-relaxed">
                <span class="font-bold block mb-1">Safety & Handling Disclosure:</span>
                {{ resource()!.safetyDisclosure }}
              </div>
            }

            <!-- Action Bar -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-neutral-100">
              <!-- Left side: Information note -->
              <div class="text-xs text-neutral-500">
                @if (canManage()) {
                  <span class="font-medium text-neutral-700">You manage this resource listing.</span>
                } @else {
                  <span>Civic surplus listing verified by Dawwarha platform standards.</span>
                }
              </div>

              <!-- Right side: Actions -->
              <div class="flex flex-wrap items-center gap-2">
                @if (canManage() && !isTerminal()) {
                  <!-- Transition: Publish (from draft) -->
                  @if (resource()!.status === 'draft') {
                    <app-button
                      variant="primary"
                      size="sm"
                      [isLoading]="isActionLoading()"
                      (clicked)="transitionStatus('publish')"
                    >
                      Publish Listing
                    </app-button>
                  }

                  <!-- Transition: Mark Unavailable (from published/available) -->
                  @if (resource()!.status === 'published' || resource()!.status === 'available') {
                    <app-button
                      variant="outline"
                      size="sm"
                      [isLoading]="isActionLoading()"
                      (clicked)="transitionStatus('markUnavailable')"
                    >
                      Mark Unavailable
                    </app-button>
                  }

                  <!-- Transition: Reopen (from unavailable) -->
                  @if (resource()!.status === 'unavailable') {
                    <app-button
                      variant="primary"
                      size="sm"
                      [isLoading]="isActionLoading()"
                      (clicked)="transitionStatus('reopen')"
                    >
                      Reopen Listing
                    </app-button>
                  }

                  <!-- Edit Action -->
                  <a [routerLink]="['/resources', resource()!.id, 'edit']">
                    <app-button variant="ghost" size="sm">
                      Edit
                    </app-button>
                  </a>

                  <!-- Cancel Action -->
                  <app-button
                    variant="danger"
                    size="sm"
                    [isLoading]="isActionLoading()"
                    (clicked)="openCancelDialog()"
                  >
                    Cancel Listing
                  </app-button>
                }

                @if (!canManage()) {
                  <a routerLink="/matches">
                    <app-button variant="primary" size="sm">
                      View Matching Demands
                    </app-button>
                  </a>
                }
              </div>
            </div>
          </app-card>
        }

        <!-- Cancellation Confirmation Modal -->
        <app-dialog
          [isOpen]="showCancelDialog()"
          title="Cancel Resource Listing"
          confirmText="Yes, Cancel Resource"
          cancelText="Keep Listing"
          confirmVariant="danger"
          (confirm)="confirmCancel()"
          (close)="showCancelDialog.set(false)"
        >
          <p class="text-sm text-neutral-600">
            Are you sure you want to cancel listing <strong>"{{ resource()?.title }}"</strong>? This action will mark the resource as cancelled and discontinue matching. This cannot be undone.
          </p>
        </app-dialog>
      </div>
    </div>
  `
})
export class ResourceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private resourceApi = inject(ResourceApiService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  readonly resource = signal<Resource | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActionLoading = signal<boolean>(false);
  readonly showCancelDialog = signal<boolean>(false);

  readonly isOwner = computed(() => {
    const res = this.resource();
    if (!res) return false;
    const currentUserId = this.authService.currentUser()?.id || this.authService.currentUser()?._id;
    if (!currentUserId) return false;

    const providerId = typeof res.providerId === 'object' && res.providerId !== null
      ? (res.providerId as any)._id || (res.providerId as any).id
      : res.providerId;

    return String(providerId) === String(currentUserId);
  });

  readonly isAdmin = computed(() => this.authService.isAdmin());
  readonly canManage = computed(() => this.isOwner() || this.isAdmin());

  readonly isTerminal = computed(() => {
    const s = this.resource()?.status;
    return ['completed', 'impact_recorded', 'cancelled', 'expired'].includes(s ?? '');
  });

  readonly timelineStep = computed<LifecycleStepId>(() => {
    const s = this.resource()?.status;
    switch (s) {
      case 'draft': return 'draft';
      case 'published': return 'published';
      case 'available': return 'available';
      case 'matched': return 'matched';
      case 'accepted': return 'accepted';
      case 'in_handover': return 'in_handover';
      case 'completed': return 'completed';
      case 'impact_recorded': return 'impact';
      default: return 'available';
    }
  });

  readonly terminalState = computed<'none' | 'cancelled' | 'failed'>(() => {
    const s = this.resource()?.status;
    if (s === 'cancelled' || s === 'expired') return 'cancelled';
    return 'none';
  });

  readonly cancelledStep = computed<LifecycleStepId | undefined>(() => {
    const s = this.resource()?.status;
    if (s === 'cancelled' || s === 'expired') {
      return this.timelineStep();
    }
    return undefined;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Resource ID not specified.');
      this.isLoading.set(false);
      return;
    }
    this.loadResource(id);
  }

  loadResource(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.resourceApi.get(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.resource.set(res);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.error?.message || err?.error?.message || 'Resource not found or failed to load.');
      }
    });
  }

  get categoryName(): string {
    const res = this.resource();
    if (res?.category?.name) return res.category.name;
    const cat = res?.categoryId;
    if (typeof cat === 'object' && cat && (cat as any).name) return (cat as any).name;
    return 'Supply Category';
  }

  get locationText(): string {
    const loc = this.resource()?.location;
    if (!loc || !loc.city) return 'Location not specified';
    return loc.city + (loc.area ? ` · ${loc.area}` : '');
  }

  get availabilityWindowText(): string {
    const win = this.resource()?.availabilityWindow;
    if (!win || !win.start || !win.end) return 'Flexible Window';
    try {
      const s = new Date(win.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const e = new Date(win.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${s} – ${e}`;
    } catch {
      return 'Scheduled Window';
    }
  }

  get formattedCreatedDate(): string {
    const d = this.resource()?.createdAt;
    if (!d) return 'Recently';
    try {
      return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  }

  get statusLabel(): string {
    const s = this.resource()?.status;
    switch (s) {
      case 'in_handover': return 'In Handover';
      case 'impact_recorded': return 'Impact Logged';
      default: return s ? s.replace('_', ' ') : 'Draft';
    }
  }

  get statusLabelColor(): string {
    const s = this.resource()?.status;
    switch (s) {
      case 'available':
      case 'published':
      case 'completed':
      case 'impact_recorded':
        return 'text-success';
      case 'matched':
        return 'text-primary';
      case 'in_handover':
      case 'accepted':
        return 'text-warning';
      case 'cancelled':
      case 'expired':
        return 'text-neutral-400';
      default:
        return 'text-neutral-700';
    }
  }

  get statusBadgeClass(): string {
    switch (this.resource()?.status) {
      case 'published':
      case 'available':
        return 'bg-success-bg text-success border-success/30';
      case 'matched':
        return 'bg-primary-100 text-primary-800 border-primary-500/30';
      case 'accepted':
      case 'in_handover':
        return 'bg-warning-bg text-warning border-warning/30';
      case 'completed':
      case 'impact_recorded':
        return 'bg-success-bg text-success border-success/30';
      case 'unavailable':
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
      case 'cancelled':
      case 'expired':
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      case 'draft':
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  }

  transitionStatus(action: ResourceLifecycleAction): void {
    const res = this.resource();
    if (!res) return;

    this.isActionLoading.set(true);
    this.resourceApi.transitionStatus(res.id, action).subscribe({
      next: (updated) => {
        this.isActionLoading.set(false);
        this.resource.set(updated);
        this.toast.success(`Resource status transitioned to '${updated.status}'`);
      },
      error: (err) => {
        this.isActionLoading.set(false);
        const msg = err?.error?.error?.message || err?.error?.message || 'Failed to transition status.';
        this.toast.error(msg);
      }
    });
  }

  openCancelDialog(): void {
    this.showCancelDialog.set(true);
  }

  confirmCancel(): void {
    const res = this.resource();
    if (!res) return;

    this.showCancelDialog.set(false);
    this.isActionLoading.set(true);

    this.resourceApi.cancel(res.id).subscribe({
      next: (cancelled) => {
        this.isActionLoading.set(false);
        this.resource.set(cancelled);
        this.toast.success('Resource cancelled successfully');
      },
      error: (err) => {
        this.isActionLoading.set(false);
        const msg = err?.error?.error?.message || err?.error?.message || 'Failed to cancel resource.';
        this.toast.error(msg);
      }
    });
  }
}
