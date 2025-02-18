// update-notification.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="p-4 @container fixed bottom-0 left-0 w-full bg-white" 
         [class.minimized]="isMinimized"
         [ngStyle]="{'transform': isMinimized ? 'translateY(calc(100% - 56px))' : 'translateY(0)'}">
      <!-- Main content -->
      <div class="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start shadow-[0_0_4px_rgba(0,0,0,0.1)] bg-white"
           [ngStyle]="{'display': isMinimized ? 'none' : 'flex'}">
        <div
          class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
          style='background-image: url("https://cdn.usegalileo.ai/sdxl10/1cb8014d-d9f5-450b-bc14-79de6bfeb00c.png");'
        ></div>
        <div class="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4 px-4">
          <p class="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">New Update Available</p>
          <div class="flex items-end gap-3 justify-between">
            <p class="text-[#637588] text-base font-normal leading-normal">Tap to download the latest version</p>
            <button
              class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#1980e6] text-white text-sm font-medium leading-normal"
              (click)="update()"
              [disabled]="isLoading"
            >
              <span class="truncate">{{ isLoading ? 'Downloading...' : 'Download' }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Control bar -->
      <div class="flex items-center gap-4 bg-white px-4 min-h-14 justify-between">
        <div class="flex items-center gap-4 cursor-pointer" (click)="toggleMinimize()">
          <div class="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-10" 
               [ngStyle]="{'transform': isMinimized ? 'rotate(180deg)' : 'rotate(0deg)'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"></path>
            </svg>
          </div>
          <p class="text-[#111418] text-base font-normal leading-normal flex-1 truncate">
            {{ isMinimized ? 'Maximize' : 'Minimize' }}
          </p>
        </div>
        <div class="shrink-0">
          <button
            (click)="hide()"
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f0f2f4] text-[#111418] text-sm font-medium leading-normal w-fit"
          >
            <span class="truncate">Hide</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .minimized {
      transition: transform 0.3s ease-in-out;
    }
  `]
})
export class UpdateNotificationComponent {
  @Input() isVisible = false;
  isLoading = false;
  isMinimized = false;
  @Output() updateApp = new EventEmitter<void>();
  @Output() hideNotification = new EventEmitter<void>();

  update() {
    this.isLoading = true;
    this.updateApp.emit();
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  hide() {
    this.isVisible = false;
    this.hideNotification.emit();
  }
}