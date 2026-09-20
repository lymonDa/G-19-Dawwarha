import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4" [dir]="isRtl ? 'rtl' : 'ltr'">
      <span class="text-7xl font-extrabold text-primary mb-2">404</span>
      <h1 class="text-2xl font-bold text-neutral-900 mb-2">
        {{ isRtl ? 'الصفحة غير موجودة' : 'Page Not Found' }}
      </h1>
      <p class="text-xs text-neutral-500 max-w-sm mb-6">
        {{ isRtl
          ? 'الصفحة التي تبحث عنها قد تم نقلها أو أن الرابط الذي اتبعته غير صحيح.'
          : "The page you're looking for may have moved or the link you followed is incorrect." }}
      </p>
      <a routerLink="/">
        <app-button variant="primary">
          {{ isRtl ? 'العودة للرئيسية' : 'Back to Home' }}
        </app-button>
      </a>
    </div>
  `
})
export class NotFoundComponent {
  protected languageService = injectLanguageService();

  get isRtl(): boolean {
    return this.languageService?.isRtl() ?? true;
  }
}

