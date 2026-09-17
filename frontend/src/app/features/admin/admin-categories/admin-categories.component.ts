import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, TableComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Resource & Request Categories</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Admin-managed unified taxonomy to ensure matching accuracy and prevent duplication.</p>
        </div>
        <app-button variant="primary" size="sm">+ New Category</app-button>
      </div>

      <app-table>
        <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-semibold">Category Name</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Description</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Status</th>
            <th class="px-4 py-3 text-end text-xs font-semibold">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100 text-xs">
          <tr class="hover:bg-neutral-50/80">
            <td class="px-4 py-3 font-bold text-neutral-900">Medical Devices & Equipment</td>
            <td class="px-4 py-3 text-neutral-600">Wheelchairs, ventilators, hospital beds</td>
            <td class="px-4 py-3"><app-badge variant="success" size="sm">Active</app-badge></td>
            <td class="px-4 py-3 text-end"><app-button variant="ghost" size="sm">Edit</app-button></td>
          </tr>
          <tr class="hover:bg-neutral-50/80">
            <td class="px-4 py-3 font-bold text-neutral-900">Furniture & Office Supplies</td>
            <td class="px-4 py-3 text-neutral-600">Desks, chairs, drawers, meeting tables</td>
            <td class="px-4 py-3"><app-badge variant="success" size="sm">Active</app-badge></td>
            <td class="px-4 py-3 text-end"><app-button variant="ghost" size="sm">Edit</app-button></td>
          </tr>
          <tr class="hover:bg-neutral-50/80">
            <td class="px-4 py-3 font-bold text-neutral-900">Educational Materials & Books</td>
            <td class="px-4 py-3 text-neutral-600">Textbooks, references, stationery supplies</td>
            <td class="px-4 py-3"><app-badge variant="success" size="sm">Active</app-badge></td>
            <td class="px-4 py-3 text-end"><app-button variant="ghost" size="sm">Edit</app-button></td>
          </tr>
        </tbody>
      </app-table>
    </div>
  `
})
export class AdminCategoriesComponent {}
