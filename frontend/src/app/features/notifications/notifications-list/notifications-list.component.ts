import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Notifications</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Track new match alerts, handover confirmations, and platform updates.</p>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <app-card padding="md" variant="bordered">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center shrink-0">
              ⚡
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-neutral-900">New smart match found — 92% compatibility</h4>
                <span class="text-[11px] text-neutral-400">10 min ago</span>
              </div>
              <p class="text-xs text-neutral-600 mt-0.5">
                The listed wheelchair resource matched a request from Nahr Al-Ataa Association within 4 km.
              </p>
            </div>
          </div>
        </app-card>

        <app-card padding="md" variant="bordered">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-success-bg text-success flex items-center justify-center shrink-0">
              ✓
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-neutral-900">Receipt confirmed for handover #H-1082</h4>
                <span class="text-[11px] text-neutral-400">2 hours ago</span>
              </div>
              <p class="text-xs text-neutral-600 mt-0.5">
                The receiving party confirmed delivery. The transfer has been successfully logged in the community impact ledger.
              </p>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class NotificationsListComponent {}
