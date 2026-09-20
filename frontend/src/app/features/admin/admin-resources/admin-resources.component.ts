import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ResourceApiService } from '../../resources/resource-api.service';
import { Resource } from '../../../core/models/resource.model';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-admin-resources',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableComponent,
    BadgeComponent,
    ButtonComponent,
    SkeletonComponent
  ],
  template: `
    <div class="flex flex-col gap-6" [dir]="isRtl ? 'rtl' : 'ltr'">
      <!-- Header Row -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">
            {{ isRtl ? 'إدارة ومراقبة الموارد المتاحة' : 'Resource Management & Monitoring' }}
          </h1>
          <p class="text-xs text-neutral-500 mt-0.5">
            {{ isRtl
              ? 'مراقبة جميع الموارد المسجلة على المنصة والتحقق من سلامتها ومطابقتها للمعايير.'
              : 'Monitor all resources registered on the platform and verify compliance with safety policies.' }}
          </p>
        </div>
        <app-button variant="outline" size="sm" (clicked)="fetchResources()">
          {{ isRtl ? 'تحديث' : 'Refresh' }}
        </app-button>
      </div>

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="p-3 rounded-md bg-danger-bg border border-danger/20 text-xs text-danger flex items-center justify-between">
          <span>{{ errorMessage() }}</span>
          <app-button variant="outline" size="sm" (clicked)="fetchResources()">
            {{ isRtl ? 'إعادة المحاولة' : 'Retry' }}
          </app-button>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="space-y-2">
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
          <app-skeleton variant="rectangular" height="40px"></app-skeleton>
        </div>
      } @else {
        <!-- Resources Table -->
        <app-table>
          <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
            <tr>
              <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'المورد' : 'Resource' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'التصنيف' : 'Category' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'الكمية' : 'Quantity' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'الموقع' : 'Location' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'الحالة' : 'Status' }}</th>
              <th class="px-4 py-3 text-end text-xs font-semibold">{{ isRtl ? 'الإجراءات' : 'Actions' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 text-xs">
            @for (res of resources(); track res.id) {
              <tr class="hover:bg-neutral-50/80 transition-colors">
                <td class="px-4 py-3 font-semibold text-neutral-900">{{ res.title }}</td>
                <td class="px-4 py-3 text-neutral-600">{{ getCategoryName(res) }}</td>
                <td class="px-4 py-3 font-mono font-medium">{{ res.quantity }} {{ isRtl ? 'وحدة' : 'units' }}</td>
                <td class="px-4 py-3 text-neutral-500">{{ res.location.city }}</td>
                <td class="px-4 py-3">
                  <app-badge [variant]="getStatusVariant(res.status)" size="sm">
                    {{ getStatusLabel(res.status) }}
                  </app-badge>
                </td>
                <td class="px-4 py-3 text-end">
                  <a [routerLink]="['/resources', res.id]">
                    <app-button variant="ghost" size="sm">
                      {{ isRtl ? 'معاينة' : 'Inspect' }}
                    </app-button>
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-xs text-neutral-500">
                  {{ isRtl ? 'لا توجد موارد مسجلة حالياً في قاعدة البيانات.' : 'No resources currently registered in the database.' }}
                </td>
              </tr>
            }
          </tbody>
        </app-table>
      }
    </div>
  `
})
export class AdminResourcesComponent implements OnInit {
  protected languageService = injectLanguageService();
  private resourceApi = inject(ResourceApiService);

  readonly resources = signal<Resource[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  ngOnInit(): void {
    this.fetchResources();
  }

  fetchResources(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.resourceApi.list({ limit: 50 }).subscribe({
      next: (page) => {
        this.isLoading.set(false);
        this.resources.set(page.items);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.error?.message || err?.error?.message || (this.isRtl ? 'تعذر جلب قائمة الموارد.' : 'Failed to load resources.')
        );
      }
    });
  }

  getCategoryName(res: Resource): string {
    if (res.category?.name) return res.category.name;
    if (typeof res.categoryId === 'object' && res.categoryId && (res.categoryId as any).name) {
      return (res.categoryId as any).name;
    }
    return this.isRtl ? 'مورد عام' : 'General Resource';
  }

  getStatusLabel(status: string): string {
    if (this.languageService) {
      return this.languageService.getStatusLabel(status);
    }
    return status;
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
    switch (status) {
      case 'published':
      case 'available':
      case 'completed':
      case 'impact_recorded':
        return 'success';
      case 'matched':
      case 'in_handover':
      case 'accepted':
        return 'warning';
      case 'cancelled':
      case 'expired':
      case 'unavailable':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
}

