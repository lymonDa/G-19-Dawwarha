import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RequestApiService } from '../services/request-api.service';
import { RequestCardComponent } from '../../../shared/components/request-card/request-card.component';
import { Request, RequestStatus, RequestUrgency } from '../../../core/models/request.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
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
