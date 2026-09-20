import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoryApiService } from '../../categories/category-api.service';
import { Category } from '../../../core/models/category.model';
import { ToastService } from '../../../core/services/toast.service';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
            {{ isRtl ? 'تصنيفات الموارد وطلبات الاحتياج' : 'Resource & Request Categories' }}
          </h1>
          <p class="text-xs text-neutral-500 mt-0.5">
            {{ isRtl
              ? 'دليل تصنيفات موحد ومراقب إدارياً لضمان دقة خوارزمية المطابقة ومنع تكرار الفئات.'
              : 'Admin-managed unified taxonomy to ensure matching accuracy and prevent duplicate categories.' }}
          </p>
        </div>
        <app-button variant="primary" size="sm" (clicked)="toggleCreateForm()">
          {{ showCreateForm()
            ? (isRtl ? 'إلغاء' : 'Cancel')
            : (isRtl ? '+ تصنيف جديد' : '+ New Category') }}
        </app-button>
      </div>

      <!-- Inline Create Category Card -->
      @if (showCreateForm()) {
        <div class="p-4 rounded-card border border-neutral-200 bg-neutral-50/80 flex flex-col gap-3">
          <h2 class="text-sm font-bold text-neutral-800">
            {{ isRtl ? 'إضافة تصنيف رسمي جديد' : 'Add New Controlled Category' }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              [placeholder]="isRtl ? 'اسم التصنيف (مثال: أجهزة مساعدة، منسوجات)' : 'Category Name (e.g. Assistive Tech, Textiles)'"
              [(ngModel)]="newCategoryName"
              class="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              [placeholder]="isRtl ? 'وصف المواد والموارد المقبولة ضمن هذا التصنيف...' : 'Description of acceptable items...'"
              [(ngModel)]="newCategoryDescription"
              class="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div class="flex justify-end gap-2">
            <app-button variant="ghost" size="sm" (clicked)="toggleCreateForm()">
              {{ isRtl ? 'إلغاء' : 'Cancel' }}
            </app-button>
            <app-button variant="primary" size="sm" [isLoading]="isCreating()" (clicked)="createCategory()">
              {{ isRtl ? 'إنشاء التصنيف' : 'Create Category' }}
            </app-button>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="p-3 rounded-md bg-danger-bg border border-danger/20 text-xs text-danger flex items-center justify-between">
          <span>{{ errorMessage() }}</span>
          <app-button variant="outline" size="sm" (clicked)="loadCategories()">
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
        <!-- Table -->
        <app-table>
          <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
            <tr>
              <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'اسم التصنيف' : 'Category Name' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'الوصف' : 'Description' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold">{{ isRtl ? 'الحالة' : 'Status' }}</th>
              <th class="px-4 py-3 text-end text-xs font-semibold">{{ isRtl ? 'الإجراءات' : 'Actions' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 text-xs">
            @for (cat of categories(); track cat.id) {
              <tr class="hover:bg-neutral-50/80 transition-colors">
                <td class="px-4 py-3 font-bold text-neutral-900">{{ cat.name }}</td>
                <td class="px-4 py-3 text-neutral-600">{{ cat.description }}</td>
                <td class="px-4 py-3">
                  <app-badge [variant]="cat.isActive ? 'success' : 'neutral'" size="sm">
                    {{ cat.isActive ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطل' : 'Inactive') }}
                  </app-badge>
                </td>
                <td class="px-4 py-3 text-end">
                  <app-button
                    [variant]="cat.isActive ? 'ghost' : 'outline'"
                    size="sm"
                    (clicked)="toggleCategoryStatus(cat)"
                  >
                    {{ cat.isActive ? (isRtl ? 'تعطيل' : 'Deactivate') : (isRtl ? 'تفعيل' : 'Activate') }}
                  </app-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-4 py-8 text-center text-xs text-neutral-500">
                  {{ isRtl ? 'لم يتم العثور على أي تصنيفات في قاعدة البيانات.' : 'No categories found in the database.' }}
                </td>
              </tr>
            }
          </tbody>
        </app-table>
      }
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  protected languageService = injectLanguageService();
  private categoryApi = inject(CategoryApiService);
  private toast = inject(ToastService);

  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly showCreateForm = signal<boolean>(false);
  readonly isCreating = signal<boolean>(false);

  newCategoryName = '';
  newCategoryDescription = '';

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.categoryApi.list(true).subscribe({
      next: (cats) => {
        this.isLoading.set(false);
        this.categories.set(cats);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.error?.message || err?.error?.message || (this.isRtl ? 'تعذر جلب التصنيفات.' : 'Failed to load categories.')
        );
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
    this.newCategoryName = '';
    this.newCategoryDescription = '';
  }

  createCategory(): void {
    const name = this.newCategoryName.trim();
    const desc = this.newCategoryDescription.trim();

    if (!name) {
      this.toast.error(this.isRtl ? 'اسم التصنيف مطلوب' : 'Category name is required');
      return;
    }

    this.isCreating.set(true);
    this.categoryApi.create({ name, description: desc || (this.isRtl ? 'تصنيف مجتمعي رسمي' : 'Civic redistribution category') }).subscribe({
      next: (cat) => {
        this.isCreating.set(false);
        this.toast.success(
          this.isRtl ? `تم إنشاء التصنيف '${cat.name}' بنجاح` : `Category '${cat.name}' created successfully`
        );
        this.toggleCreateForm();
        this.loadCategories();
      },
      error: (err) => {
        this.isCreating.set(false);
        this.toast.error(err?.error?.error?.message || err?.error?.message || (this.isRtl ? 'تعذر إنشاء التصنيف' : 'Failed to create category'));
      }
    });
  }

  toggleCategoryStatus(cat: Category): void {
    const catId = cat.id || cat._id;
    if (!catId) return;

    const newStatus = !cat.isActive;
    this.categoryApi.update(catId, { isActive: newStatus }).subscribe({
      next: () => {
        this.toast.success(
          this.isRtl
            ? `تم ${newStatus ? 'تفعيل' : 'تعطيل'} التصنيف '${cat.name}'`
            : `Category '${cat.name}' ${newStatus ? 'activated' : 'deactivated'}`
        );
        this.loadCategories();
      },
      error: (err) => {
        this.toast.error(err?.error?.error?.message || err?.error?.message || (this.isRtl ? 'تعذر تحديث حالة التصنيف' : 'Failed to update category status'));
      }
    });
  }
}

