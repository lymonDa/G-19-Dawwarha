import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-admin-resources',
  standalone: true,
  imports: [CommonModule, TableComponent, BadgeComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Resource Management & Monitoring</h1>
        <p class="text-xs text-neutral-500 mt-0.5">Monitor all resources registered on the platform and verify compliance with safety policies.</p>
      </div>

      <app-table>
        <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-semibold">Resource</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Category</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Quantity</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Location</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100 text-xs">
          <tr class="hover:bg-neutral-50/80">
            <td class="px-4 py-3 font-semibold text-neutral-900">Foldable Medical Wheelchair</td>
            <td class="px-4 py-3 text-neutral-600">Medical Devices & Equipment</td>
            <td class="px-4 py-3 font-mono">1 unit</td>
            <td class="px-4 py-3 text-neutral-500">Maadi, Cairo</td>
            <td class="px-4 py-3"><app-badge variant="success" size="sm">Available</app-badge></td>
          </tr>
          <tr class="hover:bg-neutral-50/80">
            <td class="px-4 py-3 font-semibold text-neutral-900">Study Desks & Training Chairs</td>
            <td class="px-4 py-3 text-neutral-600">Furniture & Office Supplies</td>
            <td class="px-4 py-3 font-mono">8 units</td>
            <td class="px-4 py-3 text-neutral-500">Dokki, Giza</td>
            <td class="px-4 py-3"><app-badge variant="success" size="sm">Available</app-badge></td>
          </tr>
        </tbody>
      </app-table>
    </div>
  `
})
export class AdminResourcesComponent {}
