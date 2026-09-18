import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, finalize } from 'rxjs';

import { Category } from '../../core/models/category.model';
import { ApiBaseService } from '../../core/services/api-base.service';

interface CategoryApiResponse {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesListResponse {
  success: boolean;
  count: number;
  data: CategoryApiResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {

  private api = inject(ApiBaseService);

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  readonly isLoading = signal(false);

  private loaded = false;

  list(forceRefresh = false): Observable<Category[]> {
    if (this.loaded && !forceRefresh) {
      return this.categories$;
    }

    this.isLoading.set(true);

    return this.api.get<CategoriesListResponse>('/categories').pipe(
      map(response => response.data.map(raw => this.toCategory(raw))),
      tap(categories => {
        this.categoriesSubject.next(categories);
        this.loaded = true;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  private toCategory(raw: CategoryApiResponse): Category {
    return {
      id: raw._id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }
}