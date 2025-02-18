// pwa-install.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showInstallPrompt" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-lg p-4 z-50">
      <div class="flex flex-col gap-3">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Install SmartCart</h3>
            <p class="text-sm text-gray-600 mt-1">Add SmartCart to your home screen for quick access</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button 
            (click)="installPwa()" 
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Install
          </button>
          <button 
            (click)="closePrompt(true)" 
            class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Not now
          </button>
        </div>
      </div>
    </div>
  `
})
export class PwaInstallComponent implements OnInit {
  private deferredPrompt: any;
  showInstallPrompt = false;
  private readonly INSTALL_PROMPT_KEY = 'pwa-prompt-dismissed';

  ngOnInit() {
    // Only set up the install prompt if user hasn't dismissed it before
    if (!this.hasUserDismissedPrompt()) {
      this.handleInstallPrompt();
    }
  }

  private hasUserDismissedPrompt(): boolean {
    return localStorage.getItem(this.INSTALL_PROMPT_KEY) === 'true';
  }

  private handleInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      // Store the event
      this.deferredPrompt = e;
      // Show our custom install prompt
      this.showInstallPrompt = true;
      console.log('Install prompt is ready to be shown');
    });

    window.addEventListener('appinstalled', () => {
      // Clear prompt after successful installation
      this.showInstallPrompt = false;
      this.deferredPrompt = null;
      // Save that the app was installed
      localStorage.setItem(this.INSTALL_PROMPT_KEY, 'true');
      console.log('PWA was installed successfully');
    });
  }

  async installPwa() {
    if (!this.deferredPrompt) {
      console.log('No installation prompt available');
      return;
    }

    try {
      // Show the browser's install prompt
      const result = await this.deferredPrompt.prompt();
      console.log(`Install prompt was shown: ${result}`);
      
      // Wait for the user to respond to the prompt
      const choiceResult = await this.deferredPrompt.userChoice;
      console.log(`User choice: ${choiceResult.outcome}`);
      
      // Clear the deferredPrompt since it can't be used again
      this.deferredPrompt = null;
      this.showInstallPrompt = false;

      // If user dismissed the prompt, remember their choice
      if (choiceResult.outcome === 'dismissed') {
        localStorage.setItem(this.INSTALL_PROMPT_KEY, 'true');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  }

  closePrompt(remember: boolean = true) {
    this.showInstallPrompt = false;
    if (remember) {
      // Save user's preference to not show the prompt again
      localStorage.setItem(this.INSTALL_PROMPT_KEY, 'true');
    }
  }
}