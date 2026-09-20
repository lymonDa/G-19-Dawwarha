import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { translations, TranslationDictionary } from '../i18n/translations';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

/**
 * Safely injects LanguageService, returning null if called outside an Angular injection context
 * (such as in direct unit tests instantiating components with `new Component()`).
 */
export function injectLanguageService(): LanguageService | null {
  try {
    return inject(LanguageService, { optional: true });
  } catch {
    return null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'dawwarha_lang';
  
  // Default to Arabic or saved preference
  readonly currentLanguage = signal<Language>(this.getInitialLanguage());
  readonly direction = signal<Direction>(this.currentLanguage() === 'ar' ? 'rtl' : 'ltr');

  // Reactive translations dictionary
  readonly t = computed<TranslationDictionary>(() => translations[this.currentLanguage()]);

  constructor() {
    // Apply document attributes on change
    effect(() => {
      const lang = this.currentLanguage();
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      this.direction.set(dir);
      
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.setAttribute('lang', lang);
      }
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, lang);
      }
    });
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
  }

  toggleLanguage(): void {
    const next = this.currentLanguage() === 'ar' ? 'en' : 'ar';
    this.setLanguage(next);
  }

  isRtl(): boolean {
    return this.direction() === 'rtl';
  }

  getStatusLabel(status: string | undefined | null): string {
    if (!status) return '';
    const dict = this.t();
    const normalized = String(status).toLowerCase().trim();
    switch (normalized) {
      case 'available': return dict.STATUS_AVAILABLE;
      case 'reserved': return dict.STATUS_RESERVED;
      case 'fulfilled': return dict.STATUS_FULFILLED;
      case 'cancelled': return dict.STATUS_CANCELLED;
      case 'draft': return dict.STATUS_DRAFT;
      case 'pending': return dict.STATUS_PENDING;
      case 'active': return dict.STATUS_ACTIVE;
      case 'completed': return dict.STATUS_COMPLETED;
      case 'rejected': return dict.STATUS_REJECTED;
      case 'accepted': return dict.STATUS_ACCEPTED;
      case 'in_progress': return dict.STATUS_IN_PROGRESS;
      case 'reviewed': return dict.STATUS_REVIEWED;
      case 'resolved': return dict.STATUS_RESOLVED;
      case 'suspended': return dict.STATUS_SUSPENDED;
      case 'verified': return dict.STATUS_VERIFIED;
      case 'open': return dict.STATUS_PENDING;
      default: return status;
    }
  }

  getUrgencyLabel(urgency: string | undefined | null): string {
    if (!urgency) return '';
    const dict = this.t();
    const normalized = String(urgency).toLowerCase().trim();
    switch (normalized) {
      case 'high': return dict.URGENCY_HIGH;
      case 'medium': return dict.URGENCY_MEDIUM;
      case 'low': return dict.URGENCY_LOW;
      default: return urgency;
    }
  }

  getConditionLabel(condition: string | undefined | null): string {
    if (!condition) return '';
    const dict = this.t();
    const normalized = String(condition).toLowerCase().trim();
    switch (normalized) {
      case 'new': return dict.CONDITION_NEW;
      case 'like_new': return dict.CONDITION_LIKE_NEW;
      case 'good': return dict.CONDITION_GOOD;
      case 'fair': return dict.CONDITION_FAIR;
      default: return condition;
    }
  }

  getCategoryLabel(category: any): string {
    if (!category) return '';
    if (typeof category === 'object') {
      if (this.currentLanguage() === 'ar' && category.nameAr) {
        return category.nameAr;
      }
      if (category.name) return category.name;
    }
    const dict = this.t();
    const normalized = String(category).toLowerCase().trim();
    switch (normalized) {
      case 'medical': return dict.CAT_MEDICAL;
      case 'educational': return dict.CAT_EDUCATIONAL;
      case 'furniture': return dict.CAT_FURNITURE;
      case 'food': return dict.CAT_FOOD;
      case 'clothing': return dict.CAT_CLOTHING;
      case 'electronics': return dict.CAT_ELECTRONICS;
      case 'other': return dict.CAT_OTHER;
      default: return String(category);
    }
  }

  private getInitialLanguage(): Language {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY) as Language;
      if (saved === 'ar' || saved === 'en') {
        return saved;
      }
    }
    
    // Auto-detect browser language
    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('ar')) {
        return 'ar';
      }
    }
    
    return 'en'; // Default English for Dawwarha
  }
}
