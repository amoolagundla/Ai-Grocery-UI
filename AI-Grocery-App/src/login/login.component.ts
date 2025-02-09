import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { AuthService } from '../services/auth.service';
import { GoogleAuthService } from '../services/google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-container">
      <h1>Welcome to Shopping History</h1>
      <div id="googleSignInButton"></div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 2rem;
    }
    h1 {
      color: #333;
      text-align: center;
      font-size: 2rem;
      margin-bottom: 2rem;
    }
  `]
})
export class LoginComponent implements AfterViewInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private googleAuthService: GoogleAuthService
  ) {}

  ngAfterViewInit() {
    this.googleAuthService.loadGoogleAuth().then(() => {
      this.googleAuthService.renderGoogleButton();
    });
  }
}