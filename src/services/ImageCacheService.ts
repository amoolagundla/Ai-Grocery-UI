import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

interface CachedImage {
  timestamp: number;
  data: string;  // base64 string
}

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {
  private cacheKey = 'image_cache';
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
  private maxCacheSize = 50 * 1024 * 1024; // 50MB limit

  constructor(private http: HttpClient) {
    this.cleanupCache();
  }

  getImage(url: string): Observable<string> {
    // First check cache
    const cachedImage = this.getFromCache(url);
    if (cachedImage) {
      return of(cachedImage);
    }

    // If not in cache, fetch and cache
    return this.fetchAndCacheImage(url);
  }

  private getFromCache(url: string): string | null {
    try {
      const cacheKey = `${this.cacheKey}_${this.hashUrl(url)}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const cachedImage: CachedImage = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cachedImage.timestamp > this.cacheDuration) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return cachedImage.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  private fetchAndCacheImage(url: string): Observable<any> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => this.blobToBase64(blob)),
      tap(base64 => this.saveToCache(url, base64)),
      catchError(error => {
        console.error('Error fetching image:', error);
        return throwError(() => error);
      })
    );
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private saveToCache(url: any, base64Data: any): void {
    try {
      const cacheKey = `${this.cacheKey}_${this.hashUrl(url)}`;
      const cacheData: CachedImage = {
        timestamp: Date.now(),
        data: base64Data
      };

      // Check cache size before saving
      if (this.checkCacheSize()) {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  private checkCacheSize(): boolean {
    let totalSize = 0;
    let oldestKey = '';
    let oldestTime = Date.now();

    // Calculate total cache size and find oldest entry
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.cacheKey)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length * 2; // Approximate size in bytes
          const cachedImage: CachedImage = JSON.parse(item);
          if (cachedImage.timestamp < oldestTime) {
            oldestTime = cachedImage.timestamp;
            oldestKey = key;
          }
        }
      }
    }

    // If cache is too large, remove oldest entry
    if (totalSize > this.maxCacheSize && oldestKey) {
      localStorage.removeItem(oldestKey);
    }

    return true;
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.cacheKey)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const cachedImage: CachedImage = JSON.parse(item);
            if (now - cachedImage.timestamp > this.cacheDuration) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  clearCache(): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.cacheKey)) {
        localStorage.removeItem(key);
      }
    }
  }
}