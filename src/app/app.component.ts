import { AfterViewInit, Component, importProvidersFrom, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleAuthService } from '../services/google-auth.service';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { BottomNavComponent } from '../components/bottom-nav/bottom-nav.component'; 
import { environment } from '../assets/environment';
import { SwUpdate } from '@angular/service-worker';
import { FamilyService } from '../services/FamilyService';
import { PwaInstallComponent } from "../pwainstall/pwainstall.component";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgIf, BottomNavComponent, CommonModule, PwaInstallComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit  {
  title = 'AI-Grocery-App';
  showUpdateNotification = false;

  constructor(
    public authService: AuthService,
    public familyService: FamilyService,
    private updates: SwUpdate
  ) {
    this.checkForUpdates();
  }
  ngOnInit(): void {
    this.initializeApp();
  }

  private checkForUpdates() {
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate().then((available: boolean) => {
        if (available) {
          this.showUpdateNotification = true;
        }
      });
     this.updates.versionUpdates.subscribe(()=>{
      this.showUpdateNotification = true;
     })
      this.updates.checkForUpdate().then(() => {
        this.showUpdateNotification = true;
      });
    }
  }

   

  handleUpdate() {
    window.location.reload();
  }

  // Your existing methods
  private initializeApp() {
    this.authService.user$.subscribe(user => {
      if (user?.email) {
        this.initializeFamily(user.email);
      }
    });
  }

  private initializeFamily(email: string) {
    this.familyService.initializeFamily(email).subscribe({
      next: (response) => {
        console.log('Family initialized:', response);
      },
      error: (error) => {
        console.error('Error initializing family:', error);
      }
    });
  }
}

