<<<<<<< HEAD
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { RequestCardComponent } from '../../../shared/components/request-card/request-card.component';
import { Request, RequestStatus, RequestUrgency } from '../../../core/models/request.model';
import { Category } from '../../../core/models/category.model';
=======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

@Component({
  selector: 'app-request-list',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule, RouterLink, RequestCardComponent],
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css']
})
export class RequestListComponent implements OnInit {
  private api = inject(RequestApiService);

  requests: Request[] = [];
  categories: Category[] = [];

  // Filter models
  searchTerm = '';
  selectedCategory = '';
  selectedStatus: RequestStatus | '' = '';
  selectedUrgency: RequestUrgency | '' = '';
  selectedCity = '';

  loading = true;
  errorMessage = '';

  // Pagination
  page = 1;
  limit = 12;
  hasMore = false;
  total = 0;

  private searchDebounceTimer?: any;

  ngOnInit(): void {
    this.loadCategories();
    this.loadRequests();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => {
        const data = res?.data || res || [];
        this.categories = Array.isArray(data) ? data : [];
      },
      error: () => {
        // Fallback or silence
      }
    });
  }

  loadRequests(resetPage = true): void {
    if (resetPage) {
      this.page = 1;
    }
    this.loading = true;
    this.errorMessage = '';

    this.api.getAll(
      this.page,
      this.limit,
      this.selectedStatus || undefined,
      this.selectedCategory || undefined,
      this.selectedCity || undefined,
      this.selectedUrgency || undefined
    ).subscribe({
      next: (response) => {
        const items = response.data || [];
        this.requests = items;
        this.total = response.pagination?.total || items.length;
        this.hasMore = items.length >= this.limit;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load requests. Please try again.';
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadRequests(true);
    }, 300);
  }

  onFilterChange(): void {
    this.loadRequests(true);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedUrgency = '';
    this.selectedCity = '';
    this.loadRequests(true);
  }

  get filteredRequests(): Request[] {
    if (!this.searchTerm.trim()) {
      return this.requests;
    }
    const q = this.searchTerm.toLowerCase();
    return this.requests.filter(req => {
      const desc = (req.description || '').toLowerCase();
      const city = (req.location?.city || '').toLowerCase();
      const area = (req.location?.area || '').toLowerCase();
      const catName = typeof req.categoryId === 'object' && req.categoryId?.name
        ? req.categoryId.name.toLowerCase()
        : '';
      return desc.includes(q) || city.includes(q) || area.includes(q) || catName.includes(q);
    });
  }
}
=======
  imports: [CommonModule, RouterModule, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Browse Demand Requests</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Needs registered by verified organizations and individuals to enable fair resource distribution.</p>
        </div>
        <a routerLink="/requests/create">
          <app-button variant="primary" size="sm">+ Submit a Request</app-button>
        </a>
      </div>

      <!-- Requests Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-card padding="md" [isInteractive]="true">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">Medical Devices & Equipment</span>
              <app-badge variant="danger" size="sm">Very Urgent</app-badge>
            </div>
            <h3 class="font-bold text-neutral-900 text-base">Home Ventilator / Oxygen Cylinder</h3>
            <p class="text-xs text-neutral-600 line-clamp-2">For a critical elderly case with severe respiratory issues needing immediate support.</p>
            <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Qty needed: 1 unit</span>
              <span>Dokki, Giza</span>
            </div>
          </div>
        </app-card>

        <app-card padding="md" [isInteractive]="true">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">School Supplies</span>
              <app-badge variant="warning" size="sm">Medium Priority</app-badge>
            </div>
            <h3 class="font-bold text-neutral-900 text-base">School Bags & Supplies for Primary Students</h3>
            <p class="text-xs text-neutral-600 line-clamp-2">A charity collecting supplies for 50 orphaned children at the start of the academic year.</p>
            <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Qty: 50 bags</span>
              <span>Maadi, Cairo</span>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class RequestListComponent {}
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
