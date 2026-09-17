import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-handover-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Handover Protocol</h1>
          <p class="text-xs text-neutral-500 mt-0.5">
            The platform's core guarantee: no transfer is finalized until both parties independently confirm.
          </p>
        </div>
        <app-badge [variant]="isCompleted() ? 'success' : 'warning'">
          {{ isCompleted() ? 'Completed & Logged' : 'Awaiting Confirmation' }}
        </app-badge>
      </div>

      <!-- Two-Sided Independent Indicators -->
      <app-card padding="lg" [variant]="isCompleted() ? 'sand' : 'bordered'">
        <div class="flex flex-col gap-6">
          <div class="text-center">
            <h2 class="text-lg font-bold text-neutral-900">Dual-Confirmation Status</h2>
            <p class="text-xs text-neutral-500 mt-1">Both parties must independently press their confirmation button to finalize the transfer.</p>
          </div>

          <!-- Two Independent Indicator Dots -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-white border border-neutral-200">
            <!-- Indicator 1: Provider -->
            <div class="flex items-center gap-4 p-3 rounded-lg border" [class.border-success]="providerConfirmed()" [class.bg-success-bg]="providerConfirmed()">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                [class.bg-success]="providerConfirmed()"
                [class.text-white]="providerConfirmed()"
                [class.bg-neutral-200]="!providerConfirmed()"
                [class.text-neutral-500]="!providerConfirmed()"
              >
                @if (providerConfirmed()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <span class="w-3 h-3 rounded-full bg-neutral-400"></span>
                }
              </div>
              <div>
                <p class="text-xs font-semibold text-neutral-900">Party 1: Donor (Provider)</p>
                <p class="text-[11px]" [class.text-success]="providerConfirmed()" [class.text-neutral-500]="!providerConfirmed()">
                  {{ providerConfirmed() ? 'Resource delivery confirmed ✓' : 'Awaiting donor confirmation...' }}
                </p>
              </div>
            </div>

            <!-- Indicator 2: Seeker -->
            <div class="flex items-center gap-4 p-3 rounded-lg border" [class.border-success]="seekerConfirmed()" [class.bg-success-bg]="seekerConfirmed()">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                [class.bg-success]="seekerConfirmed()"
                [class.text-white]="seekerConfirmed()"
                [class.bg-neutral-200]="!seekerConfirmed()"
                [class.text-neutral-500]="!seekerConfirmed()"
              >
                @if (seekerConfirmed()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <span class="w-3 h-3 rounded-full bg-neutral-400"></span>
                }
              </div>
              <div>
                <p class="text-xs font-semibold text-neutral-900">Party 2: Recipient (Seeker)</p>
                <p class="text-[11px]" [class.text-success]="seekerConfirmed()" [class.text-neutral-500]="!seekerConfirmed()">
                  {{ seekerConfirmed() ? 'Resource received and inspected ✓' : 'Awaiting recipient confirmation...' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons / Completion State -->
          @if (!isCompleted()) {
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <app-button
                variant="primary"
                size="lg"
                [disabled]="myConfirmed()"
                (clicked)="confirmMySide()"
              >
                {{ myConfirmed() ? 'Your confirmation recorded ✓' : 'Confirm My Side (Delivery / Receipt)' }}
              </app-button>
              
              <button
                type="button"
                (click)="simulateOtherSide()"
                class="text-xs text-primary font-medium hover:underline px-3 py-2"
              >
                Simulate other party (demo)
              </button>
            </div>
          } @else {
            <div class="p-6 rounded-xl bg-success-bg border border-success/30 text-center flex flex-col items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-neutral-900">Transfer completed & community impact recorded!</h3>
              <p class="text-xs text-neutral-600 max-w-md">
                Thank you for your active contribution. This transfer has been officially added to the impact ledger and Dawwarha's impact metrics have been updated.
              </p>
              <a routerLink="/contributions">
                <app-button variant="primary" size="md">
                  View Contributions & Impact Log →
                </app-button>
              </a>
            </div>
          }
        </div>
      </app-card>
    </div>
  `
})
export class HandoverDetailComponent {
  providerConfirmed = signal(true);
  seekerConfirmed = signal(false);
  myConfirmed = signal(false);

  isCompleted(): boolean {
    return this.providerConfirmed() && this.seekerConfirmed();
  }

  confirmMySide(): void {
    this.myConfirmed.set(true);
    this.seekerConfirmed.set(true);
  }

  simulateOtherSide(): void {
    this.providerConfirmed.set(true);
    this.seekerConfirmed.set(true);
    this.myConfirmed.set(true);
  }
}
