import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const matchRoutes: Routes = [

  {
    path: 'matches',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./match-list/match-list.component')
        .then(m => m.MatchListComponent)
  },

  {
    path: 'matches/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./match-detail/match-detail.component')
        .then(m => m.MatchDetailComponent)
  }

];