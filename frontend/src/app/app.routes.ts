import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/requests/request.routes')
        .then(m => m.requestRoutes)
  },

  {
    path: '',
    loadChildren: () =>
      import('./features/matches/match.routes')
        .then(m => m.matchRoutes)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: '**',
    redirectTo: 'requests'
  }
];