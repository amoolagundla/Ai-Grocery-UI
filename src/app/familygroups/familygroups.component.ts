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
  

 <section class="mb-8" *ngIf="currentFamily">
   <div class="p-4">
     <div class="flex items-stretch justify-between gap-4 rounded-xl bg-[#FFFBF5] p-4">
       <div class="flex flex-col gap-1 flex-[2_2_0px]">
         <p class="text-[#1C160C] text-base font-bold leading-tight">{{currentFamily.familyName}}</p>
         <p class="text-[#A18249] text-sm font-normal leading-normal">Primary Contact: {{currentFamily.primaryEmail}}</p>
       </div>
       <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1" 
            style="background-image: url('https://cdn.usegalileo.ai/sdxl10/63d28c40-8f5d-4f2c-aa7f-a218c9b6af24.png');">
       </div>
     </div>
   </div>

   <div class="px-4 pt-6">
 <h3 class="text-[#1C160C] text-lg font-bold leading-tight tracking-[-0.015em] pb-4">Invite Family</h3>
 <div class="flex flex-col max-w-[480px] gap-4">
   <label class="flex flex-col w-full">
     <input
       type="email"
       [(ngModel)]="inviteEmail"
       placeholder="Enter email address"
       class="form-input w-full resize-none overflow-hidden rounded-xl text-[#1C160C] focus:outline-0 focus:ring-0 border border-[#E9DFCE] bg-[#FFFFFF] focus:border-[#E9DFCE] h-14 placeholder:text-[#A18249] p-[15px] text-base font-normal leading-normal"
     />
   </label>
   <button
     (click)="sendInvite()"
     [disabled]="!inviteEmail || !familyService.getFamilyId()"
     class="w-full flex justify-center items-center rounded-xl h-14 px-4 bg-[#1C160C] text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
   >
     <span class="truncate">Send Invitation</span>
   </button>
 </div>
 <p class="text-[#1C160C] text-sm font-normal leading-normal mt-2">
   We'll send them an invitation to join the family network.
 </p>
</div>
 </section>

 <section class="mb-8 px-4" *ngIf="invites.length > 0">
   <h3 class="text-[#1C160C] text-lg font-bold leading-tight tracking-[-0.015em] pb-4">Pending Invites</h3>
   <div class="grid gap-4">
     <div *ngFor="let invite of invites" 
          class="p-4 rounded-xl bg-[#FFFBF5] border border-[#E9DFCE]">
       <div class="flex justify-between items-center">
         <div>
           <p class="text-[#1C160C] font-medium">From: {{invite.invitedBy}}</p>
           <p class="text-[#A18249] text-sm">Sent: {{invite.createdAt | date}}</p>
         </div>
         <div class="flex gap-2">
           <button
             (click)="processInvite(invite.inviteId, 'accept')"
             class="flex items-center justify-center rounded-xl h-10 px-4 bg-[#1C160C] text-white text-sm font-bold"
           >
             Accept
           </button>
           <button
             (click)="processInvite(invite.inviteId, 'reject')"
             class="flex items-center justify-center rounded-xl h-10 px-4 bg-transparent text-[#1C160C] text-sm font-bold border border-[#E9DFCE]"
           >
             Decline
           </button>
         </div>
       </div>
     </div>
   </div>
 </section>

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