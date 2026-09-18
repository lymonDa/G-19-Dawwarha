import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { Category } from '../../core/models/category.model';
import { ApiBaseService } from '../../core/services/api-base.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {

  private api = inject(ApiBaseService);

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  private loaded = false;

  list(): Observable<Category[]> {
    if (this.loaded) {
      return this.categories$;
    }

    return this.api.get<Category[]>('/categories').pipe(
      tap(categories => {
        this.categoriesSubject.next(categories);
        this.loaded = true;
      })
    );
  }

  refresh(): Observable<Category[]> {
    this.loaded = false;
    return this.list();
  }
}