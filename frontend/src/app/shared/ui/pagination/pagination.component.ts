import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-white sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <app-button
          variant="secondary"
          size="sm"
          [disabled]="page <= 1"
          (clicked)="onPageChange(page - 1)"
        >
          السابق
        </app-button>
        <app-button
          variant="secondary"
          size="sm"
          [disabled]="page >= totalPages"
          (clicked)="onPageChange(page + 1)"
        >
          التالي
        </app-button>
      </div>

      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-xs text-neutral-600">
            عرض
            <span class="font-medium">{{ startIndex }}</span>
            إلى
            <span class="font-medium">{{ endIndex }}</span>
            من إجمالي
            <span class="font-medium">{{ total }}</span>
            عنصر
          </p>
        </div>

        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              type="button"
              [disabled]="page <= 1"
              (click)="onPageChange(page - 1)"
              class="relative inline-flex items-center px-2 py-2 rounded-s-md border border-neutral-200 bg-white text-xs font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span class="sr-only">السابق</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            @for (p of displayedPages; track p) {
              <button
                type="button"
                (click)="onPageChange(p)"
                class="relative inline-flex items-center px-3.5 py-2 border text-xs font-medium"
                [class.bg-primary]="p === page"
                [class.text-white]="p === page"
                [class.border-primary]="p === page"
                [class.bg-white]="p !== page"
                [class.text-neutral-700]="p !== page"
                [class.border-neutral-200]="p !== page"
                [class.hover:bg-neutral-50]="p !== page"
              >
                {{ p }}
              </button>
            }

            <button
              type="button"
              [disabled]="page >= totalPages"
              (click)="onPageChange(page + 1)"
              class="relative inline-flex items-center px-2 py-2 rounded-e-md border border-neutral-200 bg-white text-xs font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span class="sr-only">التالي</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() limit = 10;
  @Input() total = 0;
  @Input() totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  get displayedPages(): number[] {
    const pages: number[] = [];
    const maxDisplayed = 5;
    let start = Math.max(1, this.page - 2);
    let end = Math.min(this.totalPages, start + maxDisplayed - 1);

    if (end - start < maxDisplayed - 1) {
      start = Math.max(1, end - maxDisplayed + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(p: number): void {
    if (p >= 1 && p <= this.totalPages && p !== this.page) {
      this.pageChange.emit(p);
    }
  }
}
