// header.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { Observable } from 'rxjs';
import { UpdateNotificationComponent } from '../app/update-notification/update-notification.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, UpdateNotificationComponent],
  template: `
    <header class="header">
      <app-update-notification
        [isVisible]="showUpdateNotification"
        (updateApp)="handleUpdate()"
      ></app-update-notification>
      <!-- Rest of your header content -->
      <div class="profile" *ngIf="user$ | async as user">
        <img [src]="user.photoURL" class="profile-image" alt="Profile">
        <button class="logout-button" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [/* your existing styles */]
})
export class HeaderComponent implements OnInit {
  @Input() showUpdateNotification = false;
  user$: Observable<User | null> | undefined;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.user$;
  }

  handleUpdate() {
    window.location.reload();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}