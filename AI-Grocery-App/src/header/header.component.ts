import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common'; 
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  template: `
    <header class="header">
      <h1>Shopping History</h1>
      <div class="profile" *ngIf="user$ | async as user">
        <img [src]="user.photoURL" [alt]="user.name" class="profile-image">
        <span class="user-name">{{ user.name }}</span>
        <button (click)="logout()" class="logout-button">Logout</button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    .profile {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .profile-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .logout-button {
      padding: 8px 16px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class HeaderComponent implements OnInit { 
   user$:Observable<User | null> | undefined;
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.user$ = this.authService.user$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}