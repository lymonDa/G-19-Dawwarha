import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';

@Component({
  selector: 'app-resource-create',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">List a Surplus Resource</h1>
        <p class="text-xs text-neutral-500 mt-0.5">Specify the resource details, quantity, and location to begin matching with organizations and recipients.</p>
      </div>

      <app-card padding="lg">
        <form class="flex flex-col gap-4">
          <app-input label="Resource Title" placeholder="e.g. 5 study desks in good condition" [required]="true"></app-input>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-neutral-900">Category <span class="text-danger">*</span></label>
            <select class="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>Medical Devices & Equipment</option>
              <option>Furniture & Office Supplies</option>
              <option>Books & Educational Materials</option>
              <option>Clothing & Apparel</option>
              <option>Electronics & Devices</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <app-input label="Quantity" type="number" placeholder="1" [required]="true"></app-input>
            <app-input label="Unit" placeholder="unit, box, piece"></app-input>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-neutral-900">Description & Condition</label>
            <textarea rows="3" placeholder="Describe the resource specs and any important details about its condition..." class="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <app-input label="City" placeholder="Cairo" [required]="true"></app-input>
            <app-input label="Neighborhood / Area" placeholder="Maadi" [required]="true"></app-input>
          </div>

          <div class="pt-4 flex justify-end">
            <app-button variant="primary">Publish Resource & Activate Matching</app-button>
          </div>
        </form>
      </app-card>
    </div>
  `
})
export class ResourceCreateComponent {}
