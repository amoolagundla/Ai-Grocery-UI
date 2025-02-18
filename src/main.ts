import { bootstrapApplication } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth'; 
import { AppComponent } from './app/app.component';
import { environment } from './assets/environment';
import { appConfig } from './app/app.config'; 


  if ('serviceWorker' in navigator) {
    bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err)); 
  }