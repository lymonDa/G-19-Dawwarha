import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
<<<<<<< HEAD
import { provideRouter } from '@angular/router';
=======
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from '../../app.routes';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
<<<<<<< HEAD
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
=======
    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
  ]
};
