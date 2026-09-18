import { Injectable, signal, computed } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private queue: ToastMessage[] = [];
  private activeToastSignal = signal<ToastMessage | null>(null);
  private currentTimer: any = null;

  // toasts() returns an array with at most 1 element (the active toast) for template iteration
  readonly toasts = computed<ToastMessage[]>(() => {
    const active = this.activeToastSignal();
    return active ? [active] : [];
  });

  readonly activeToast = this.activeToastSignal.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): string {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 4000;
    const newToast: ToastMessage = { ...toast, id, duration };

    this.queue.push(newToast);

    // If no toast is currently displaying, process queue
    if (!this.activeToastSignal()) {
      this.processQueue();
    }

    return id;
  }

  private processQueue(): void {
    if (this.currentTimer) {
      clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }

    if (this.queue.length === 0) {
      this.activeToastSignal.set(null);
      return;
    }

    const nextToast = this.queue.shift()!;
    this.activeToastSignal.set(nextToast);

    if (nextToast.duration && nextToast.duration > 0) {
      this.currentTimer = setTimeout(() => {
        this.dismiss(nextToast.id);
      }, nextToast.duration);
    }
  }

  success(message: string, title?: string): string {
    return this.show({ variant: 'success', message, title });
  }

  error(message: string, title?: string): string {
    return this.show({ variant: 'error', message, title });
  }

  info(message: string, title?: string): string {
    return this.show({ variant: 'info', message, title });
  }

  warning(message: string, title?: string): string {
    return this.show({ variant: 'warning', message, title });
  }

  dismiss(id?: string): void {
    const active = this.activeToastSignal();
    if (!id || (active && active.id === id)) {
      if (this.currentTimer) {
        clearTimeout(this.currentTimer);
        this.currentTimer = null;
      }
      this.activeToastSignal.set(null);
      // Small pause before showing next toast in queue for smooth transition
      setTimeout(() => {
        this.processQueue();
      }, 150);
    } else {
      // Remove from queue if pending
      this.queue = this.queue.filter(t => t.id !== id);
    }
  }

  clear(): void {
    if (this.currentTimer) {
      clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }
    this.queue = [];
    this.activeToastSignal.set(null);
  }
}
