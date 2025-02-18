// update-notification.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="flex items-center px-3 py-1 bg-blue-50 border-b border-blue-100">
      <div class="flex items-center text-sm text-blue-700">
        <i class="material-icons text-sm mr-1.5">system_update</i>
        <span class="mr-2">Update available</span>
      </div>
      <button
        (click)="update()"
        [disabled]="isLoading"
        class="flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
      >
        <span *ngIf="!isLoading">Refresh</span>
        <i *ngIf="isLoading" class="material-icons animate-spin">refresh</i>
      </button>
    </div>
  `
})
export class UpdateNotificationComponent {
  @Input() isVisible = false;
  isLoading = false;
  @Output() updateApp = new EventEmitter<void>();

  update() {
    this.isLoading = true;
    this.updateApp.emit();
  }
}