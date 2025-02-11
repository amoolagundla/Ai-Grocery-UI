import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { NotifierModule } from 'angular-notifier';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    importProvidersFrom(NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'right', // Position of notifications horizontally
          distance: 12,
        },
        vertical: {
          position: 'top', // Position of notifications vertically
          distance: 12,
          gap: 10,
        },
      },
      theme: 'material', // Theme for notifications
      behaviour: {
        autoHide: 5000, // Auto-hide after 5 seconds
        onClick: false,
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 4, // Maximum number of notifications stacked
      },
      animations: {
        enabled: true,
        show: {
          preset: 'slide',
          speed: 300,
          easing: 'ease',
        },
        hide: {
          preset: 'fade',
          speed: 300,
          easing: 'ease',
          offset: 50,
        },
        shift: {
          speed: 300,
          easing: 'ease',
        },
        overlap: 150,
      },
    })) 
  ]
};
