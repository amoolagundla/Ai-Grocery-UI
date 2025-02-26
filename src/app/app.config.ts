import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode, ErrorHandler } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../assets/environment';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http'; 
import { AuthInterceptor } from '../services/AuthInterceptor';
import { AppInsightsService } from '../services/AppInsightsService';

class GlobalErrorHandler implements ErrorHandler {
  constructor(private appInsightsService: AppInsightsService) {}

  handleError(error: any): void {
    this.appInsightsService.logException(error);
    console.error('Error from global error handler', error);
  }
}

// Initialize App Insights and configure it
const appInsightsFactory = (router: Router) => {
  const service = new AppInsightsService(router);
  service.init();
  return service;
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },{
      provide: AppInsightsService,
      useFactory: appInsightsFactory,
      deps: [Router]
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
      deps: [AppInsightsService]
    }
   
  ]
};