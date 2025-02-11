import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { AuthService } from '../services/auth.service';
import { GoogleAuthService } from '../services/google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
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
export class LoginComponent implements OnInit,AfterViewInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private googleAuthService: GoogleAuthService
  ) {}
  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/purchases']); //  
    }
  }
  ngAfterViewInit() {
    this.googleAuthService.loadGoogleAuth().then(() => {
      this.googleAuthService.renderGoogleButton();
    });
  }
}