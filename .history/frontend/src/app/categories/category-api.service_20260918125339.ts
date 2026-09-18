import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { ApiBaseService } from '../core/services/api-base.service';
import { Category } from '../core/models/category.model';

export type CategoryWrite = Pick<Category, 'name' | 'description' | 'isActive'>;

interface CategoryResponse {
	success: boolean;
	data: Category[];
}

interface SingleCategoryResponse {
	success: boolean;
	data: Category;
}

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
	private readonly api = inject(ApiBaseService);
	private readonly categoriesSignal = signal<Category[]>([]);
	private request$?: Observable<Category[]>;
	private hasLoaded = false;

	readonly categories = this.categoriesSignal.asReadonly();
	readonly isLoading = signal(false);
	readonly error = signal<string | null>(null);

	list(forceRefresh = false): Observable<Category[]> {
		if (!forceRefresh && this.hasLoaded) {
			return of(this.categoriesSignal());
		}

		if (!forceRefresh && this.request$) {
			return this.request$;
		}

		this.isLoading.set(true);
		this.error.set(null);

		const request$ = this.api.get<CategoryResponse>('/categories').pipe(
			map(response => response.data),
			tap(categories => {
				this.categoriesSignal.set(categories);
				this.hasLoaded = true;
			}),
			catchError(error => {
				this.error.set(error?.message || "Couldn't load categories");
				return throwError(() => error);
			}),
			finalize(() => {
				this.isLoading.set(false);
				this.request$ = undefined;
			}),
			shareReplay({ bufferSize: 1, refCount: false })
		);

		this.request$ = request$;
		return request$;
	}

	refresh(): Observable<Category[]> {
		return this.list(true);
	}

	create(payload: CategoryWrite): Observable<Category> {
		return this.api.post<SingleCategoryResponse>('/categories', payload).pipe(
			map(response => response.data),
			tap(() => this.refresh().subscribe())
		);
	}

	update(id: string, payload: Partial<CategoryWrite>): Observable<Category> {
		return this.api.put<SingleCategoryResponse>(`/categories/${id}`, payload).pipe(
			map(response => response.data),
			tap(() => this.refresh().subscribe())
		);
	}

	delete(id: string): Observable<Category> {
		return this.api.delete<SingleCategoryResponse>(`/categories/${id}`).pipe(
			map(response => response.data),
			tap(() => this.refresh().subscribe())
		);
	}
}
