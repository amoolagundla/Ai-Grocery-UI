import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface Receipt {
  id: string;
  userId: string;
  familyId: string;
  receiptText: string;
  blobUrl: string;
  createdAt: string;
}

interface CacheData {
  timestamp: number;
  data: Receipt[];
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptsService {
  private apiUrl = 'https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api/receipts';
  private cacheKey = 'receipts_cache';
  private cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
  private receiptsSubject = new BehaviorSubject<Receipt[]>([]);
  
  constructor(private http: HttpClient) {}

  private saveToCache(data: Receipt[], email: string): void {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(`${this.cacheKey}_${email}`, JSON.stringify(cacheData));
    this.receiptsSubject.next(data);
  }

  private getFromCache(email: string): Receipt[] | null {
    const cached = localStorage.getItem(`${this.cacheKey}_${email}`);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - cacheData.timestamp > this.cacheDuration) {
      localStorage.removeItem(`${this.cacheKey}_${email}`);
      return null;
    }

    return cacheData.data;
  }

  getReceipts(email: string): Observable<Receipt[]> {
    // First check the BehaviorSubject
    if (this.receiptsSubject.value.length > 0) {
      return of(this.receiptsSubject.value);
    }

    // Then check localStorage
    const cachedData = this.getFromCache(email);
    if (cachedData) {
      this.receiptsSubject.next(cachedData);
      return of(cachedData);
    }

    // If no cache, fetch from API
    return this.http.get<Receipt[]>(`${this.apiUrl}?email=${email}`).pipe(
      tap(data => this.saveToCache(data, email)),
      catchError(error => {
        console.error('Error fetching receipts:', error);
        return of([]);
      })
    );
  }

  forceRefresh(email: string): Observable<Receipt[]> {
    localStorage.removeItem(`${this.cacheKey}_${email}`);
    return this.http.get<Receipt[]>(`${this.apiUrl}?email=${email}`).pipe(
      tap(data => this.saveToCache(data, email)),
      catchError(error => {
        console.error('Error fetching receipts:', error);
        return of([]);
      })
    ); 
  }

  clearCache(email: string): void {
    localStorage.removeItem(`${this.cacheKey}_${email}`);
    this.receiptsSubject.next([]);
  }
}