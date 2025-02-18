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
    <div class="sticky top-0 z-50 bg-white   flex items-center bg-white p-4 pb-2 justify-between" *ngIf="user$ | async as user">
    <div class="flex size-12 shrink-0 items-center">
      <div
        class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
        [style.backgroundImage]="'url(' + user.photoURL + ')'"
      ></div>
    </div>
    <h2 class="text-[#111418] text-lg  leading-tight tracking-[-0.015em] flex-1">AI Smart Cart</h2>
    <div class="flex w-12 items-center justify-end">
      <button (click)="logout()" class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent text-[#111418] gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
        <div class="text-[#111418]" data-icon="DoorOpen" data-size="24px" data-weight="regular">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M232,216H208V40a16,16,0,0,0-16-16H64A16,16,0,0,0,48,40V216H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM192,40V216H176V40ZM64,40h96V216H64Zm80,92a12,12,0,1,1-12-12A12,12,0,0,1,144,132Z"></path>
          </svg>
        </div>
      </button>
    </div>
    <app-update-notification
    [isVisible]="showUpdateNotification"
    (updateApp)="handleUpdate()"
  ></app-update-notification>
  <!-- Rest of your header content -->
  <div class="profile" *ngIf="user$ | async as user">
     
    <button class="logout-button" (click)="logout()"> </button>
  </div>
  </div>
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