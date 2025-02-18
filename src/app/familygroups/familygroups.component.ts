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
  template: `
    <div class="container mx-auto">
      <!-- Family Group Section -->
      <section class="mb-8" *ngIf="currentFamily">
        <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          Your Family Group
        </h2>
        
        <div class="px-4">
          <div class="p-4 rounded-xl bg-[#e7edf3]">
            <h3 class="text-[#0e141b] text-lg font-bold">{{currentFamily.familyName}}</h3>
            <p class="text-[#4e7397]">Primary Contact: {{currentFamily.primaryEmail}}</p>
          </div>
        </div>
      </section>

      <!-- Invite Member Section -->
      <section class="mb-8">
        <h1 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          Invite Family
        </h1>
        
        <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label class="flex flex-col min-w-40 flex-1">
            <input
              type="email"
              [(ngModel)]="inviteEmail"
              placeholder="Enter email, phone number or name"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            />
          </label>
        </div>
        
        <p class="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4">
          We'll send them an invitation to join the family network.
        </p>
        
        <div class="flex px-4 py-3">
          <button
            (click)="sendInvite()"
            [disabled]="!inviteEmail || !familyService.getFamilyId()"
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#308ce8] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
            [class.opacity-50]="!inviteEmail || !familyService.getFamilyId()"
          >
            <span class="truncate">Send Invitation</span>
          </button>
        </div>
      </section>

      <!-- Pending Invites Section -->
      <section class="mb-8" *ngIf="invites.length > 0">
        <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          Pending Invites
        </h2>
        
        <div class="grid gap-4 px-4">
          <div *ngFor="let invite of invites" 
               class="p-4 rounded-xl bg-[#e7edf3]">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-[#0e141b] font-medium">From: {{invite.invitedBy}}</p>
                <p class="text-[#4e7397] text-sm">
                  Sent: {{invite.createdAt | date}}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  (click)="processInvite(invite.inviteId, 'accept')"
                  class="flex items-center justify-center rounded-xl h-10 px-4 bg-[#308ce8] text-slate-50 text-sm font-bold"
                >
                  Accept
                </button>
                <button
                  (click)="processInvite(invite.inviteId, 'reject')"
                  class="flex items-center justify-center rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold border border-[#0e141b]"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Messages -->
      <div *ngIf="error" class="mx-4 mb-4 p-4 rounded-xl bg-red-50 text-red-700 border-l-4 border-red-500">
        <p>{{error}}</p>
      </div>
      
      <div *ngIf="successMessage" class="mx-4 mb-4 p-4 rounded-xl bg-green-50 text-green-700 border-l-4 border-green-500">
        <p>{{successMessage}}</p>
      </div>
    </div>
  `
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
          this.currentFamily = family[0];
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
        this.invites = invites;
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

  processInvite(inviteId: string, action: 'accept' | 'reject') {
    const processSub = this.familyService.processInvite(inviteId, action).subscribe({
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