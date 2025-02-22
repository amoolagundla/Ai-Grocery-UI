// login.component.ts
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { Capacitor } from '@capacitor/core';
import { CommonModule } from '@angular/common';

import { PushNotificationService } from '../services/PushNotificationService';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container bg-white min-h-screen">
      <div class="flex flex-col items-center justify-center px-4 py-8 space-y-6">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">AI Smart Cart</h1>
          <p class="text-gray-600">Sign in to manage your shopping lists s</p>
        </div>

        <!-- Web Sign-In Button -->
        <div *ngIf="!isNativePlatform" 
             id="googleSignInButton"
             class="w-full max-w-md">
        </div>

        <!-- Mobile Sign-In Button -->
        <button *ngIf="isNativePlatform"
                (click)="signInWithGoogle()"
                class="flex items-center justify-center w-full max-w-md px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg"  class="w-6 h-6 mr-3" viewBox="0 0 24 24">
  <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
  <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
  <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
  <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
</svg>
              
          <span>Sign in with Google </span>
        </button>

        <!-- Loading State -->
        <div *ngIf="isLoading" 
             class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" 
             class="text-red-500 text-center mt-4">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: white;
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit {

  isNativePlatform = Capacitor.isNativePlatform();
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private googleAuthService: GoogleAuthService,
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/purchases']);
    }
  }

  async ngAfterViewInit() {
    if (!this.isNativePlatform) {
      try {
        await this.googleAuthService.loadGoogleAuth();
        this.googleAuthService.renderGoogleButton();
      } catch (error) {
        console.error('Failed to load Google Auth:', error);
        this.errorMessage = 'Failed to initialize sign-in. Please try again.';
      }
    }
  }

  async signInWithGoogle() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.googleAuthService.signIn();
    } catch (error) {
      console.error('Sign in error:', error);
      this.errorMessage = 'Failed to sign in. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

}