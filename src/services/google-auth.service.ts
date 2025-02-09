import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
declare var google:any;
@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
    private googleClientId = '330943388161-nng1skva9rdl0ql4q0t3j19g1otuofcd.apps.googleusercontent.com';

    constructor(
      private authService: AuthService,
      private router: Router
    ) {
      this.handleCredentialResponse = this.handleCredentialResponse.bind(this);
    }
  
    async loadGoogleAuth(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (document.getElementById('google-jssdk')) {
          resolve();
          return;
        }
  
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-jssdk';
        script.async = true;
        script.defer = true;
  
        script.onload = () => {
          console.log('Google Sign-In script loaded.');
          google.accounts.id.initialize({
            client_id: this.googleClientId,
            callback: this.handleCredentialResponse
          });
          resolve();
        };
  
        script.onerror = () => {
          console.error('Google Sign-In script failed to load.');
          reject();
        };
  
        document.head.appendChild(script);
      });
    }
  
    handleCredentialResponse(response: any) {
      console.log('Google Auth Response:', response);
      const credential = response.credential;
      if (credential) {
        const userInfo = this.parseJwt(credential);
        console.log('User Info:', userInfo);
        this.authService.setUser(userInfo);
        this.router.navigate(['/purchases']);
      }
    }
  
    parseJwt(token: string) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    }
  
    renderGoogleButton() {
      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { theme: 'outline', size: 'large' }
      );
    }
}
