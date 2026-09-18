import { Injectable, signal, computed, effect } from '@angular/core';
import { translations, TranslationDictionary } from '../i18n/translations';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

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
