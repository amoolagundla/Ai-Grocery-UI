import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Injectable({
  providedIn: 'root'
})
export class StatusBarService {
  async setStyle(style: 'dark' | 'light') {
    await StatusBar.setStyle({
      style: style === 'dark' ? Style.Dark : Style.Light
    });
  }

  async hide() {
    await StatusBar.hide();
  }

  async show() {
    await StatusBar.show();
  }

  async setBackgroundColor(color: string) {
    await StatusBar.setBackgroundColor({ color });
  }
}