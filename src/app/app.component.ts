import { AfterViewInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleAuthService } from '../services/google-auth.service';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';
import { BottomNavComponent } from '../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,NgIf,BottomNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent   {
  title = 'AI-Grocery-App';
  constructor(public authService: AuthService) {}
}
