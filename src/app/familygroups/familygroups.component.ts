import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; 
import { Family, FamilyInvite, FamilyService } from '../../services/FamilyService';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-familygroups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:"./familygroups.component.html"
})
export class FamilygroupsComponent implements OnInit {
  currentFamily: Family | null = null;
  invites: FamilyInvite[] = [];
  loading = true;
  error = '';
  successMessage = '';
  inviteEmail = '';
  user: any;
  
  // Add subscriptions tracking
  private subscriptions: Subscription[] = [];

  constructor(
    public familyService: FamilyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async loadData() {
    // Track the user subscription
    const userSub = this.authService.user$.pipe(
      take(1)
    ).subscribe(user => {
      if (user?.email) {
        this.user = user;
        this.fetchFamilyDetails(user.email);
        this.fetchInvites(user.email);
      }
    });
    this.subscriptions.push(userSub);
  }

  fetchFamilyDetails(email: string) {
    const familyId = this.familyService.getFamilyId();
    if (familyId) {
      const familySub = this.familyService.getFamilyDetails(familyId).subscribe({
        next: (family: any) => {
          this.currentFamily = Array.isArray(family) ? family[0] : family;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Family fetch error:', error);
          this.error = 'Failed to load family details';
          this.loading = false;
        }
      });
      this.subscriptions.push(familySub);
    }
  }

  fetchInvites(email: string) {
    const invitesSub = this.familyService.getPendingInvites(email).subscribe({
      next: (invites: any) => {
      // Ensure invites is always an array
      this.invites = Array.isArray(invites) ? invites : [];
      },
      error: (error: any) => {
        this.error = 'Failed to load invites';
      }
    });
    this.subscriptions.push(invitesSub);
  }

  sendInvite() {
    if (!this.user?.email || !this.inviteEmail) return;

    const familyId = this.familyService.getFamilyId();
    if (!familyId) {
      this.error = 'Family ID not found';
      return;
    }
    
    const sendInviteSub = this.familyService.sendInvite(familyId, this.inviteEmail, this.user.email).subscribe({
      next: () => {
        this.successMessage = 'Invitation sent successfully!';
        this.inviteEmail = '';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.error = 'Failed to send invitation';
        setTimeout(() => this.error = '', 3000);
      }
    });
    this.subscriptions.push(sendInviteSub);
  }

  processInvite(inviteId: string,invitedUserEmail:string, action: 'accept' | 'reject') {
    const processSub = this.familyService.processInvite(inviteId,invitedUserEmail, action).subscribe({
      next: () => {
        this.successMessage = `Invitation ${action}ed successfully!`;
        this.loadData();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.error = `Failed to ${action} invitation`;
        setTimeout(() => this.error = '', 3000);
      }
    });
    this.subscriptions.push(processSub);
  }
}