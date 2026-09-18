import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CategorySelectorComponent } from '../../../shared/components/category-selector/category-selector.component';

@Component({
  selector: 'app-request-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, ButtonComponent, InputComponent, CategorySelectorComponent],
  template: `
    <div class="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">Submit a Demand Request</h1>
        <p class="text-xs text-neutral-500 mt-0.5">Register what your organization or beneficiary needs — it will be automatically matched with donors in the same geographic area.</p>
      </div>

      <app-card padding="lg">
        <form class="flex flex-col gap-4">
          <app-input label="Request Title" placeholder="e.g. 10 wheelchairs needed for elderly care home" [required]="true"></app-input>

          <div class="grid grid-cols-2 gap-3">
            <app-category-selector [(ngModel)]="categoryId" name="categoryId" [required]="true"></app-category-selector>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-neutral-900">Urgency Level <span class="text-danger">*</span></label>
              <select class="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="high">Very Urgent (Top Priority)</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low / Non-Urgent</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <app-input label="Quantity Needed" type="number" placeholder="1" [required]="true"></app-input>
            <app-input label="Governorate / Area" placeholder="Dokki, Giza" [required]="true"></app-input>
          </div>

          <div class="pt-4 flex justify-end">
            <app-button variant="primary">Publish Request & Monitor Matches</app-button>
          </div>
        </form>
      </app-card>
    </div>
  `
})
export class RequestCreateComponent {
  categoryId: string | null = null;
}
