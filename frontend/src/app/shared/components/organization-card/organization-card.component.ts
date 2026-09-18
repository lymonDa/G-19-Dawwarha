import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Organization } from '../../../core/models/organization.model';
import { VerificationBadgeComponent } from '../verification-badge/verification-badge.component';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { BadgeComponent } from '../../ui/badge/badge.component';

@Component({
  selector: 'app-organization-card',
  standalone: true,
  imports: [CommonModule, VerificationBadgeComponent, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <app-card [variant]="variant === 'interactive' ? 'interactive' : 'bordered'" padding="md">
      <div class="flex flex-col gap-3">
        <!-- Header: Name + Badge -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-50 text-primary font-semibold flex items-center justify-center text-base shrink-0 border border-primary-100">
              {{ org.name.charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-semibold text-neutral-900 text-base">{{ org.name }}</h4>
                <app-verification-badge [status]="org.verificationStatus"></app-verification-badge>
              </div>
              <span class="text-xs text-neutral-500">{{ getTypeText(org.type) }}</span>
            </div>
          </div>

          @if (org.stats) {
            <div class="hidden sm:flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-200">
              <span>{{ org.stats.resourcesShared }} موارد تم مشاركتها</span>
            </div>
          }
        </div>

        <!-- Description -->
        @if (org.description) {
          <p class="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {{ org.description }}
          </p>
        }

        <!-- Contact & Location -->
        @if (getCity() || getEmail()) {
          <div class="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            @if (getCity()) {
              <div class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{{ getCity() }} @if (getAddress()) { - {{ getAddress() }} }</span>
              </div>
            }

            @if (getEmail()) {
              <div class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{{ getEmail() }}</span>
              </div>
            }
          </div>
        }

        <!-- Admin Review Actions -->
        @if (variant === 'admin-review') {
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            @if (getStatus() === 'pending') {
              <app-button
                variant="danger"
                size="sm"
                [isLoading]="isProcessing"
                (clicked)="reject.emit(org.id || (orgAny)._id)"
              >
                رفض التوثيق
              </app-button>
              <app-button
                variant="primary"
                size="sm"
                [isLoading]="isProcessing"
                (clicked)="verify.emit(org.id || (orgAny)._id)"
              >
                اعتماد وتوثيق
              </app-button>
            } @else {
              <app-badge [variant]="getStatus() === 'verified' || getStatus() === 'approved' ? 'success' : 'danger'">
                {{ getStatus() === 'verified' || getStatus() === 'approved' ? 'تم التوثيق' : 'مرفوض' }}
              </app-badge>
            }
          </div>
        }
      </div>
    </app-card>
  `
})
export class OrganizationCardComponent {
  @Input({ required: true }) org!: Organization;
  @Input() variant: 'default' | 'admin-review' | 'interactive' = 'default';
  @Input() isProcessing = false;

  @Output() verify = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  get orgAny(): any {
    return this.org as any;
  }

  getCity(): string {
    return this.orgAny?.contact?.city || this.orgAny?.contactInfo?.address?.city || '';
  }

  getAddress(): string {
    return this.orgAny?.contact?.address || this.orgAny?.contactInfo?.address?.street || '';
  }

  getEmail(): string {
    return this.orgAny?.contact?.email || this.orgAny?.contactInfo?.email || '';
  }

  getStatus(): string {
    return this.orgAny?.verificationStatus || this.orgAny?.verification?.status || 'pending';
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'ngo': return 'منظمة غير حكومية (NGO)';
      case 'charity': return 'جمعية خيرية';
      case 'community_group': return 'مبادرة مجتمعية';
      case 'educational': return 'مؤسسة تعليمية';
      default: return 'منظمة أهلية';
    }
  }
}
