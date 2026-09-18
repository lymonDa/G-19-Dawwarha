import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const requestRoutes: Routes = [

  {
    path: 'requests',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./request-list/request-list.component')
        .then(m => m.RequestListComponent)
  },

  {
    path: 'requests/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./request-form/request-form.component')
        .then(m => m.RequestFormComponent)
  },

  {
    path: 'requests/mine',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./my-requests/my-requests.component')
        .then(m => m.MyRequestsComponent)
  },

  {
    path: 'requests/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./request-form/request-form.component')
        .then(m => m.RequestFormComponent)
  },

  {
    path: 'requests/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./request-detail/request-detail.component')
        .then(m => m.RequestDetailComponent)
  }

];