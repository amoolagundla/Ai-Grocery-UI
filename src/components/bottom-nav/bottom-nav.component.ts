import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { routes } from '../../app/app.routes';

@Component({
  selector: 'app-bottom-nav',
  standalone: true, 
  imports:[CommonModule,RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css'] 
})
export class BottomNavComponent {
  constructor(public router: Router) {}

 public isActive(route: string): boolean {
    return this.router.url === route;
  }
}
