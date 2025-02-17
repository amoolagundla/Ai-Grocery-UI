import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Family, FamilyInvite, FamilyService } from '../../services/FamilyService';

@Component({
  selector: 'app-familygroups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto">
      <!-- Family Groups Section -->
      <section class="mb-8" *ngIf="families.length > 0">
        <h2 class="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          Your Family Groups
        </h2>
        
        <div *ngIf="!loading" class="grid gap-4 px-4">
          <div *ngFor="let family of families" 
               class="p-4 rounded-xl bg-[#e7edf3]">
            <h3 class="text-[#0e141b] text-lg font-bold">{{family.familyName}}</h3>
            <p class="text-[#4e7397]">Primary Contact: {{family.primaryEmail}}</p>
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
    [disabled]="!inviteEmail"
    class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#308ce8] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
    [class.opacity-50]="!inviteEmail"
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
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FamilygroupsComponent implements OnInit {
  families: Family[] = [];
  invites: FamilyInvite[] = [];
  loading = true;
  error = '';
  successMessage = '';
  inviteEmail = '';
  user: any;

  constructor(
    private familyService: FamilyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.authService.user$.subscribe(user => {
      if (user?.email) {
        this.user = user;
        this.fetchFamilies(user.email);
        this.fetchInvites(user.email);
      }
    });
  }
  fetchFamilies(email: string) {
    this.familyService.getFamilies(email).subscribe({
        next: (families) => {
            console.log('Families:', families); // Add this
            this.families = families;
            this.loading = false;
        },
        error: (error) => {
            console.error('Family fetch error:', error); // Add this
            this.error = 'Failed to load families';
            this.loading = false;
        }
    });
}

  fetchInvites(email: string) {
    this.familyService.getPendingInvites(email).subscribe({
      next: (invites) => {
        this.invites = invites;
      },
      error: (error) => {
        this.error = 'Failed to load invites';
      }
    });
  }

  sendInvite() {
    if (!this.user?.email || !this.inviteEmail) return; // Remove !this.families.length check

    // Make sure to use correct case for ID/id
    const familyId = this.families[0]?.Id || this.families[0]?.Id;
    
    if (!familyId) {
        this.error = 'No family ID found';
        return;
    }
    
    this.familyService.sendInvite(familyId, this.inviteEmail, this.user.email).subscribe({
        next: () => {
            this.successMessage = 'Invitation sent successfully!';
            this.inviteEmail = '';
            setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
            this.error = 'Failed to send invitation';
            setTimeout(() => this.error = '', 3000);
        }
    });
}

  processInvite(inviteId: string, action: 'accept' | 'reject') {
    this.familyService.processInvite(inviteId, action).subscribe({
      next: () => {
        this.successMessage = `Invitation ${action}ed successfully!`;
        this.loadData();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.error = `Failed to ${action} invitation`;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
}