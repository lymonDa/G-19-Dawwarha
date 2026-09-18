import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, TableComponent, BadgeComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Demand Requests Management</h1>
        <p class="text-xs text-neutral-500 mt-0.5">Monitor requests registered by organizations and individuals, and track fulfilment rates and distribution.</p>
      </div>

      <app-table>
        <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-semibold">Request</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Category</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Urgency</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Location</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100 text-xs">
          <tr class="hover:bg-neutral-50/80">
            <td class="px-4 py-3 font-semibold text-neutral-900">Home Ventilator / Oxygen Cylinder</td>
            <td class="px-4 py-3 text-neutral-600">Medical Devices & Equipment</td>
            <td class="px-4 py-3"><app-badge variant="danger" size="sm">Very Urgent</app-badge></td>
            <td class="px-4 py-3 text-neutral-500">Dokki, Giza</td>
            <td class="px-4 py-3"><app-badge variant="warning" size="sm">Matching</app-badge></td>
          </tr>
        </tbody>
      </app-table>
    </div>
  `
})
export class AdminRequestsComponent {}
