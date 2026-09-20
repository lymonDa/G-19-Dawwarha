import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, NotificationType } from '../../../core/models/notification.model';
import { LanguageService, injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notification) {
      <li
        class="p-4 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer list-none select-none"
        [ngClass]="{
          'bg-primary-50/30 border-primary-200 hover:border-primary-400': isUnread,
          'bg-white border-neutral-200 hover:border-neutral-300 opacity-90': !isUnread
        }"
        [attr.aria-label]="accessibleAriaLabel"
        role="article"
        tabindex="0"
        (click)="handleClick()"
        (keydown.enter)="handleClick()"
        (keydown.space)="handleClick()"
      >
        <!-- Type Icon matching triggering domain -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
          [ngClass]="getIconContainerClass(notification.type)"
          aria-hidden="true"
        >
          @switch (notification.type) {
            @case ('match_created') {
              <!-- Link icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
            @case ('match_accepted') {
              <!-- Handshake / accepted icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            }
            @case ('report_resolved') {
              <!-- Shield check icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            @case ('org_verification_decided') {
              <!-- Badge verification icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            @default {
              <!-- Bell / Announcement icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          }
        </div>

        <!-- Content & Message -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h4
              class="text-sm leading-snug"
              [ngClass]="isUnread ? 'font-bold text-neutral-900' : 'font-medium text-neutral-700'"
            >
              {{ notification.title }}
            </h4>

            <!-- Unread Dot + Accessible Status -->
            <div class="flex items-center gap-1.5 shrink-0">
              @if (isUnread) {
                <span
                  class="inline-block w-2.5 h-2.5 rounded-full bg-primary shrink-0"
                  aria-hidden="true"
                ></span>
                <span class="sr-only">إشعار جديد غير مقروء</span>
              }
              <span class="text-[11px] text-neutral-400 font-mono">
                {{ notification.createdAt | date:'shortTime' }}
              </span>
            </div>
          </div>

          <p
            class="text-xs mt-1 leading-relaxed line-clamp-2"
            [ngClass]="isUnread ? 'text-neutral-800 font-medium' : 'text-neutral-500'"
          >
            {{ notification.message }}
          </p>

          <div class="mt-2 flex items-center justify-between">
            <span class="text-[10px] text-neutral-400">
              {{ notification.createdAt | date:'mediumDate' }}
            </span>

            @if (isUnread) {
              <button
                type="button"
                (click)="onMarkAsRead($event)"
                class="text-[11px] text-primary hover:underline font-medium cursor-pointer"
              >
                {{ isEnglish ? 'Mark as read' : 'تحديد كمقروء' }}
              </button>
            }
          </div>
        </div>
      </li>
    }
  `
})
export class NotificationItemComponent {
  private languageService = injectLanguageService();

  @Input() notification?: Notification;
  @Output() selected = new EventEmitter<Notification>();
  @Output() markRead = new EventEmitter<Notification>();

  get isEnglish(): boolean {
    return this.languageService?.currentLanguage() === 'en';
  }

  get isUnread(): boolean {
    if (!this.notification) return false;
    if (this.notification.readAt !== undefined) {
      return this.notification.readAt === null;
    }
    return !this.notification.read;
  }

  get accessibleAriaLabel(): string {
    if (!this.notification) return this.isEnglish ? 'Notification' : 'إشعار';
    const prefix = this.isEnglish
      ? (this.isUnread ? 'Unread notification: ' : 'Read notification: ')
      : (this.isUnread ? 'إشعار غير مقروء: ' : 'إشعار مقروء: ');
    return `${prefix}${this.notification.title}. ${this.notification.message}`;
  }

  getIconContainerClass(type: NotificationType): string {
    switch (type) {
      case 'match_created':
        return 'bg-info-bg text-info';
      case 'match_accepted':
        return 'bg-success-bg text-success';
      case 'report_resolved':
        return 'bg-primary-100 text-primary';
      case 'org_verification_decided':
        return 'bg-warning-bg text-warning';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  }

  handleClick(): void {
    if (this.notification) {
      this.selected.emit(this.notification);
    }
  }

  onMarkAsRead(event: MouseEvent): void {
    event.stopPropagation();
    if (this.notification) {
      this.markRead.emit(this.notification);
    }
  }
}
