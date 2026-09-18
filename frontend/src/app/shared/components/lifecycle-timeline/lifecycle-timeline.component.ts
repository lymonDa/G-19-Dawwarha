import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LifecycleStepId =
  | 'draft'
  | 'published'
  | 'available'
  | 'matched'
  | 'accepted'
  | 'in_handover'
  | 'completed'
  | 'impact';

export type StepVisualState = 'completed' | 'active' | 'upcoming' | 'cancelled' | 'failed';

export interface LifecycleStepDef {
  id: LifecycleStepId;
  label: string;
  shortLabel?: string;
  icon: string;
}

export interface HandoverConfirmationState {
  confirmedByProvider: boolean;
  confirmedBySeeker: boolean;
  providerLabel?: string;
  seekerLabel?: string;
  isViewerProvider?: boolean;
}

export const LIFECYCLE_STEPS: LifecycleStepDef[] = [
  { id: 'draft', label: 'Draft', icon: 'file-edit' },
  { id: 'published', label: 'Published', icon: 'megaphone' },
  { id: 'available', label: 'Available', icon: 'circle-check' },
  { id: 'matched', label: 'Matched', icon: 'link' },
  { id: 'accepted', label: 'Accepted', icon: 'handshake' },
  { id: 'in_handover', label: 'In Handover', icon: 'truck' },
  { id: 'completed', label: 'Completed', icon: 'check-check' },
  { id: 'impact', label: 'Impact', icon: 'sparkles' },
];

@Component({
  selector: 'app-lifecycle-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <!-- Desktop Horizontal Timeline (md and up) -->
      <nav aria-label="Progress" class="hidden md:block">
        <ol class="flex items-start justify-between relative w-full">
          @for (step of steps; track step.id; let idx = $index; let isLast = $last) {
            <li
              class="relative flex-1 flex flex-col items-center group"
              [attr.aria-current]="getStepState(step.id) === 'active' ? 'step' : null"
            >
              <!-- Connecting Line to next step -->
              @if (!isLast) {
                <div
                  class="absolute top-4 start-1/2 w-full h-0.5 -translate-y-1/2 -z-0"
                  [ngClass]="getConnectorClass(step.id, idx)"
                  aria-hidden="true"
                ></div>
              }

              <!-- Step Circle Node -->
              <div
                class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold select-none transition-colors"
                [ngClass]="getCircleClass(step.id)"
              >
                @switch (getStepState(step.id)) {
                  @case ('completed') {
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="sr-only">(Completed)</span>
                  }
                  @case ('active') {
                    <span class="w-2.5 h-2.5 rounded-full bg-white" aria-hidden="true"></span>
                    <span class="sr-only">(Current)</span>
                  }
                  @case ('cancelled') {
                    <svg class="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                    </svg>
                    <span class="sr-only">(Cancelled)</span>
                  }
                  @case ('failed') {
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span class="sr-only">(Failed)</span>
                  }
                  @default {
                    <span class="w-2 h-2 rounded-full bg-neutral-300" aria-hidden="true"></span>
                    <span class="sr-only">(Upcoming)</span>
                  }
                }
              </div>

              <!-- Step Label -->
              <div class="mt-2 text-center px-1">
                <span
                  class="text-xs transition-colors"
                  [ngClass]="getLabelClass(step.id)"
                >
                  {{ step.label }}
                </span>
              </div>

              <!-- In Handover Dedicated Sub-Slot: Two Independent Indicators inside 'in_handover' step -->
              @if (step.id === 'in_handover' && handoverConfirmation) {
                <div
                  id="desktop-handover-indicators"
                  class="mt-3 w-full max-w-[200px] flex flex-col gap-1.5 p-2 rounded-md bg-neutral-50 border border-neutral-200 text-start text-xs shadow-xs"
                >
                  <div class="font-medium text-neutral-500 text-[10px] uppercase tracking-wider mb-0.5">
                    Two-Sided Status
                  </div>
                  
                  <!-- Indicator 1: Provider / Donor -->
                  <div class="flex items-center gap-2" id="desktop-provider-indicator">
                    @if (handoverConfirmation.confirmedByProvider) {
                      <span class="flex items-center justify-center w-4 h-4 rounded-full bg-success text-white shrink-0" aria-hidden="true">
                        <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    } @else {
                      <span class="flex items-center justify-center w-4 h-4 rounded-full border-2 border-warning text-warning shrink-0" aria-hidden="true">
                        <span class="w-1.5 h-1.5 rounded-full bg-warning"></span>
                      </span>
                    }
                    <span class="text-[11px] leading-tight font-medium text-neutral-800">
                      {{ getProviderIndicatorLabel() }}
                    </span>
                  </div>

                  <!-- Indicator 2: Seeker / Recipient -->
                  <div class="flex items-center gap-2" id="desktop-seeker-indicator">
                    @if (handoverConfirmation.confirmedBySeeker) {
                      <span class="flex items-center justify-center w-4 h-4 rounded-full bg-success text-white shrink-0" aria-hidden="true">
                        <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    } @else {
                      <span class="flex items-center justify-center w-4 h-4 rounded-full border-2 border-warning text-warning shrink-0" aria-hidden="true">
                        <span class="w-1.5 h-1.5 rounded-full bg-warning"></span>
                      </span>
                    }
                    <span class="text-[11px] leading-tight font-medium text-neutral-800">
                      {{ getSeekerIndicatorLabel() }}
                    </span>
                  </div>
                </div>
              }
            </li>
          }
        </ol>
      </nav>

      <!-- Mobile Vertical Stepper (below md) -->
      <nav aria-label="Progress" class="block md:hidden">
        <!-- Collapsible completed steps control when multiple completed -->
        @if (completedCount > 2) {
          <div class="mb-3">
            <button
              type="button"
              (click)="toggleCompletedCollapse()"
              class="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              [attr.aria-expanded]="!isCompletedCollapsed"
            >
              <span>{{ isCompletedCollapsed ? 'Show previous ' + completedCount + ' completed steps' : 'Hide completed steps' }}</span>
              <svg
                class="w-3.5 h-3.5 transition-transform"
                [class.rotate-180]="!isCompletedCollapsed"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        }

        <ol class="relative flex flex-col space-y-4">
          @for (step of steps; track step.id; let idx = $index; let isLast = $last) {
            @if (!isCompletedCollapsed || getStepState(step.id) !== 'completed' || idx === completedCount - 1) {
              <li
                #stepElement
                class="relative flex items-start gap-3"
                [attr.aria-current]="getStepState(step.id) === 'active' ? 'step' : null"
                [id]="'mobile-step-' + step.id"
              >
                <!-- Vertical Line to next step -->
                @if (!isLast) {
                  <div
                    class="absolute top-8 start-4 -ms-[1px] w-0.5 h-[calc(100%-1rem)] -z-0"
                    [ngClass]="getVerticalConnectorClass(step.id, idx)"
                    aria-hidden="true"
                  ></div>
                }

                <!-- Step Circle Node -->
                <div
                  class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold select-none shrink-0 transition-colors"
                  [ngClass]="getCircleClass(step.id)"
                >
                  @switch (getStepState(step.id)) {
                    @case ('completed') {
                      <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span class="sr-only">(Completed)</span>
                    }
                    @case ('active') {
                      <span class="w-2.5 h-2.5 rounded-full bg-white" aria-hidden="true"></span>
                      <span class="sr-only">(Current)</span>
                    }
                    @case ('cancelled') {
                      <svg class="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                      </svg>
                      <span class="sr-only">(Cancelled)</span>
                    }
                    @case ('failed') {
                      <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span class="sr-only">(Failed)</span>
                    }
                    @default {
                      <span class="w-2 h-2 rounded-full bg-neutral-300" aria-hidden="true"></span>
                      <span class="sr-only">(Upcoming)</span>
                    }
                  }
                </div>

                <!-- Step Details -->
                <div class="flex-1 pt-1 text-start">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-sm transition-colors"
                      [ngClass]="getLabelClass(step.id)"
                    >
                      {{ step.label }}
                    </span>
                    @if (getStepState(step.id) === 'active') {
                      <span class="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-primary-100 text-primary">
                        Current
                      </span>
                    }
                  </div>

                  <!-- Two independent indicators inside 'in_handover' step on mobile -->
                  @if (step.id === 'in_handover' && handoverConfirmation) {
                    <div
                      id="mobile-handover-indicators"
                      class="mt-2.5 w-full flex flex-col gap-2 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs shadow-2xs"
                    >
                      <div class="font-semibold text-neutral-600 text-[11px] uppercase tracking-wider mb-0.5">
                        Two-Sided Confirmation Status
                      </div>

                      <!-- Indicator 1: Provider / Donor -->
                      <div class="flex items-center gap-2.5" id="mobile-provider-indicator">
                        @if (handoverConfirmation.confirmedByProvider) {
                          <span class="flex items-center justify-center w-5 h-5 rounded-full bg-success text-white shrink-0" aria-hidden="true">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        } @else {
                          <span class="flex items-center justify-center w-5 h-5 rounded-full border-2 border-warning text-warning shrink-0" aria-hidden="true">
                            <span class="w-2 h-2 rounded-full bg-warning"></span>
                          </span>
                        }
                        <span class="text-xs font-medium text-neutral-800">
                          {{ getProviderIndicatorLabel() }}
                        </span>
                      </div>

                      <!-- Indicator 2: Seeker / Recipient -->
                      <div class="flex items-center gap-2.5" id="mobile-seeker-indicator">
                        @if (handoverConfirmation.confirmedBySeeker) {
                          <span class="flex items-center justify-center w-5 h-5 rounded-full bg-success text-white shrink-0" aria-hidden="true">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        } @else {
                          <span class="flex items-center justify-center w-5 h-5 rounded-full border-2 border-warning text-warning shrink-0" aria-hidden="true">
                            <span class="w-2 h-2 rounded-full bg-warning"></span>
                          </span>
                        }
                        <span class="text-xs font-medium text-neutral-800">
                          {{ getSeekerIndicatorLabel() }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </li>
            }
          }
        </ol>
      </nav>
    </div>
  `
})
export class LifecycleTimelineComponent implements OnInit, AfterViewInit {
  @Input() currentStep: LifecycleStepId = 'in_handover';
  @Input() terminalState: 'none' | 'cancelled' | 'failed' = 'none';
  @Input() cancelledAtStep?: LifecycleStepId = 'in_handover';
  @Input() handoverConfirmation?: HandoverConfirmationState | null = null;

  @ViewChild('stepElement') activeStepElement?: ElementRef<HTMLElement>;

  readonly steps = LIFECYCLE_STEPS;
  isCompletedCollapsed = true;

  ngOnInit(): void {
    // Keep initialized
  }

  ngAfterViewInit(): void {
    // Scroll active step into view on mobile if present
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const activeEl = document.getElementById(`mobile-step-${this.currentStep}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  get currentStepIndex(): number {
    return this.steps.findIndex((s) => s.id === this.currentStep);
  }

  get completedCount(): number {
    if (this.terminalState !== 'none') {
      const stopIndex = this.cancelledAtStep
        ? this.steps.findIndex((s) => s.id === this.cancelledAtStep)
        : this.currentStepIndex;
      return Math.max(0, stopIndex);
    }
    return Math.max(0, this.currentStepIndex);
  }

  toggleCompletedCollapse(): void {
    this.isCompletedCollapsed = !this.isCompletedCollapsed;
  }

  getStepState(stepId: LifecycleStepId): StepVisualState {
    const stepIndex = this.steps.findIndex((s) => s.id === stepId);
    const currentIndex = this.currentStepIndex;

    if (this.terminalState === 'cancelled') {
      const stopIndex = this.cancelledAtStep
        ? this.steps.findIndex((s) => s.id === this.cancelledAtStep)
        : currentIndex;
      if (stepIndex < stopIndex) return 'completed';
      if (stepIndex === stopIndex) return 'cancelled';
      return 'upcoming';
    }

    if (this.terminalState === 'failed') {
      const stopIndex = this.cancelledAtStep
        ? this.steps.findIndex((s) => s.id === this.cancelledAtStep)
        : currentIndex;
      if (stepIndex < stopIndex) return 'completed';
      if (stepIndex === stopIndex) return 'failed';
      return 'upcoming';
    }

    // Normal progression
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  }

  getCircleClass(stepId: LifecycleStepId): string {
    const state = this.getStepState(stepId);
    switch (state) {
      case 'completed':
        return 'bg-success text-white';
      case 'active':
        return 'bg-primary text-white font-bold ring-4 ring-primary-100 motion-safe:animate-pulse';
      case 'cancelled':
        return 'bg-neutral-100 border-2 border-neutral-400 text-neutral-600';
      case 'failed':
        return 'bg-danger text-white';
      case 'upcoming':
      default:
        return 'bg-white border-2 border-neutral-300 text-neutral-400';
    }
  }

  getLabelClass(stepId: LifecycleStepId): string {
    const state = this.getStepState(stepId);
    switch (state) {
      case 'completed':
        return 'font-medium text-neutral-700';
      case 'active':
        return 'font-bold text-primary';
      case 'cancelled':
        return 'font-medium text-neutral-500 line-through';
      case 'failed':
        return 'font-semibold text-danger';
      case 'upcoming':
      default:
        return 'font-normal text-neutral-400';
    }
  }

  getConnectorClass(stepId: LifecycleStepId, idx: number): string {
    const nextStep = this.steps[idx + 1];
    if (!nextStep) return '';

    const currentState = this.getStepState(stepId);
    const nextState = this.getStepState(nextStep.id);

    if (currentState === 'completed' && (nextState === 'completed' || nextState === 'active')) {
      return 'bg-success';
    }
    return 'border-t-2 border-dashed border-neutral-200';
  }

  getVerticalConnectorClass(stepId: LifecycleStepId, idx: number): string {
    const nextStep = this.steps[idx + 1];
    if (!nextStep) return '';

    const currentState = this.getStepState(stepId);
    const nextState = this.getStepState(nextStep.id);

    if (currentState === 'completed' && (nextState === 'completed' || nextState === 'active')) {
      return 'bg-success';
    }
    return 'border-s-2 border-dashed border-neutral-200';
  }

  getProviderIndicatorLabel(): string {
    if (!this.handoverConfirmation) return 'Provider confirmation';
    if (this.handoverConfirmation.providerLabel) {
      return this.handoverConfirmation.providerLabel;
    }

    const isViewer = this.handoverConfirmation.isViewerProvider === true;
    if (this.handoverConfirmation.confirmedByProvider) {
      return isViewer ? 'You confirmed (Donor)' : 'Donor confirmed';
    } else {
      return isViewer ? 'Pending your confirmation (Donor)' : 'Waiting on donor confirmation';
    }
  }

  getSeekerIndicatorLabel(): string {
    if (!this.handoverConfirmation) return 'Seeker confirmation';
    if (this.handoverConfirmation.seekerLabel) {
      return this.handoverConfirmation.seekerLabel;
    }

    const isViewer = this.handoverConfirmation.isViewerProvider === false;
    if (this.handoverConfirmation.confirmedBySeeker) {
      return isViewer ? 'You confirmed (Recipient)' : 'Recipient confirmed';
    } else {
      return isViewer ? 'Pending your confirmation (Recipient)' : 'Waiting on recipient confirmation';
    }
  }
}
