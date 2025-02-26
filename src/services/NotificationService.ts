// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { FamilyService } from './FamilyService';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private pendingInvitesCount = new BehaviorSubject<number>(0);
    pendingInvites$ = this.pendingInvitesCount.asObservable();

    constructor(
        private familyService: FamilyService,
        private authService: AuthService
    ) {
        this.initializeNotifications();
    }

    private async initializeNotifications() {
        this.authService.user$.subscribe(user => {

            if (user?.email) {
                //this.updatePendingInvites(user.email);
            }
        }); 
        
    }

    async refreshNotifications() {
        this.authService.user$.subscribe(user => {

            if (user?.email) {
                this.updatePendingInvites(user.email);
            }
        });
    }

    private updatePendingInvites(email: string) {
        this.familyService.getPendingInvites(email).subscribe({
            next: (invites: any) => {
                this.pendingInvitesCount.next(invites.length);
            },
            error: (error: any) => {
                console.error('Error fetching pending invites:', error);
            }
        });
    }
}
