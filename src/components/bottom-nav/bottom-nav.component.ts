import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { routes } from '../../app/app.routes';
import { NotificationService } from '../../services/NotificationService';

@Component({
  selector: 'app-bottom-nav',
  standalone: true, 
  imports:[CommonModule,RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css'] 
})
export class BottomNavComponent {
  pendingInvites$ :any;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.pendingInvites$= this.notificationService.pendingInvites$;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
