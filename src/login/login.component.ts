// login.component.ts
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { Capacitor } from '@capacitor/core';
import { CommonModule } from '@angular/common';
import { AuthOService } from '../services/authOService';
import { GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,GoogleSigninButtonModule],
  template: `
    <div class="login-container bg-white min-h-screen">
      <div class="flex flex-col items-center justify-center px-4 py-8 space-y-6">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">AI Smart Cart</h1>
          <p class="text-gray-600">Sign in to manage your shopping lists s</p>
        </div>

        <!-- Web Sign-In Button -->
        <!-- <div *ngIf="!isNativePlatform" 
             id="googleSignInButton"
             class="w-full max-w-md">
        </div> -->

        <!-- Mobile Sign-In Button -->
        <!-- <button *ngIf="isNativePlatform"
                (click)="signInWithGoogle()"
                class="flex items-center justify-center w-full max-w-md px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <img src="assets/google-logo.png" 
               alt="Google" 
               class="w-6 h-6 mr-3">
          <span>Sign in with Google </span>
        </button> -->
        <asl-google-signin-button type='standard' size='large'></asl-google-signin-button>

        <button (click)="logIIN()">BBBB</button>

   

        <div class="login-button">

  <!-- <button mat-raised-button (click)="signInWithGooglee()">

    <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"

      alt="Google"

      class="google-icon"

    />

    Sign in with Google sd

  </button> -->



</div>

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

  socialAuthService = inject(SocialAuthService)
  isNativePlatform = Capacitor.isNativePlatform();
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private googleAuthService: GoogleAuthService,
    private authOService: AuthOService

  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/purchases']);
    }

    this.authOService.initConfiguration();


    // this.userProfile = this.authOService.getProfileAuth2();
    console.log('this.authOService.getProfileAuth2(): ', this.authOService.getProfileAuth2());


    this.socialAuthService.authState.subscribe((result)=>{
      console.log('result: ', result);

    })

  }

  logIIN(){
    console.log("asas")
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((x)=>{
      console.log('x:xcxcxc ', x);

    })
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

  async signInWithGooglee() {
    console.log("asas")
    this.authOService.loginAuth2();


  }
}