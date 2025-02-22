import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleAuthService } from '../services/google-auth.service';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { BottomNavComponent } from '../components/bottom-nav/bottom-nav.component';
import { FamilyService } from '../services/FamilyService';
import { PwaInstallComponent } from "../pwainstall/pwainstall.component";
import { StatusBarService } from '../services/StatusBarService';
import { PushNotificationService } from '../services/PushNotificationService';
import { Subscription, distinctUntilChanged, filter, take } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgIf, BottomNavComponent, CommonModule, PwaInstallComponent],
  providers: [PushNotificationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'AI-Grocery-App';
  isDark = false;
  showUpdateNotification = false;
  private subscriptions = new Subscription();
  private familyInitialized = false;

  constructor(
    public authService: AuthService,
    public familyService: FamilyService,
    private statusBar: StatusBarService,
    private pushNotificationService: PushNotificationService
  ) {
  }

  ngOnInit(): void {


    // Initialize push notifications only after user is logged in
    this.authService.user$.pipe(
      filter(user => !!user), // Only proceed if there's a user
      take(1) // Take only the first emission and then complete
    ).subscribe(() => {
      // Wait a moment before requesting permissions
      setTimeout(() => {
        this.initializeApp();
        this.statusBar.setStyle(this.isDark ? 'dark' : 'light');
      }, 2000); // Wait 2 seconds after login
    });

  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  handleUpdate() {
    window.location.reload();
  }

  private initializeApp() {
    this.pushNotificationService.initPushNotifications();

    // Add user subscription with filtering
    this.subscriptions.add(
      this.authService.user$.pipe(
        filter(user => !!user?.email && !this.familyInitialized),
        distinctUntilChanged((prev, curr) => prev?.email === curr?.email),
        take(1)
      ).subscribe(user => {
        if (user?.email) {
          this.initializeFamily(user.email);
        }
      })
    );
  }

  private initializeFamily(email: string) {
    if (this.familyInitialized) return;

    this.subscriptions.add(
      this.familyService.initializeFamily(email).subscribe({
        next: (response) => {
          console.log('Family initialized:', response);
          if (response && response.familyId) {
            this.familyInitialized = true;
            this.authService.setFamilyId(response.familyId);
          }
        },
        error: (error) => {
          console.error('Error initializing family:', error);
          this.familyInitialized = false;
        }
      })
    );
  }
}