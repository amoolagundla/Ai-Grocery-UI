import { AfterViewInit, Component, importProvidersFrom } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleAuthService } from '../services/google-auth.service';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { BottomNavComponent } from '../components/bottom-nav/bottom-nav.component'; 
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,NgIf,BottomNavComponent,  CommonModule
    
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent   {
  title = 'AI-Grocery-App';
  constructor(public authService: AuthService ) {}

  showNotification(type: string, message: string): void { 
  }

  triggerSuccess(): void {
    this.showNotification('success', 'This is a success notification!');
  }

  triggerError(): void {
    this.showNotification('error', 'This is an error notification!');
  }
}
