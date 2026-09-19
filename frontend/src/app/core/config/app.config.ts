import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  LucideAngularModule,
  ChevronDown,
  Check,
  X,
  Search,
  AlertCircle,
  UploadCloud,
  File,
  FileText,
  Image,
  Minus,
  Loader2,
  CheckCircle2,
  Info,
  AlertTriangle
} from 'lucide-angular';
import { appRoutes } from '../../app.routes';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(
      LucideAngularModule.pick({
        ChevronDown,
        Check,
        X,
        Search,
        AlertCircle,
        UploadCloud,
        File,
        FileText,
        Image,
        Minus,
        Loader2,
        CheckCircle2,
        Info,
        AlertTriangle
      })
    )
  ]
};
