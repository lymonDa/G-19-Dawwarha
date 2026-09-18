import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastComponent } from './shared/ui/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent],
  template: `
    <!-- Top-bar route/chunk navigation progress loader -->
    @if (isNavigating()) {
      <div class="fixed top-0 inset-x-0 h-1 z-50 overflow-hidden bg-primary-100">
        <div class="h-full bg-primary animate-pulse w-full"></div>
      </div>
    }

    <!-- Toast Notification Container -->
    <app-toast-container></app-toast-container>

    <!-- Routed Views -->
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  readonly isNavigating = signal(false);
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart || event instanceof RouteConfigLoadStart) {
        this.isNavigating.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof RouteConfigLoadEnd
      ) {
        this.isNavigating.set(false);

        if (event instanceof NavigationEnd) {
          // Accessibility: Shift focus to primary heading or main content
          setTimeout(() => {
            if (typeof document !== 'undefined') {
              const target = document.querySelector<HTMLElement>('main h1, h1, [role="main"]');
              if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
              }
            }
          }, 100);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
