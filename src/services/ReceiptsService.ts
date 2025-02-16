import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

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
  private apiBaseUrl = 'https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api';
  private cacheKey = 'receipts_cache';
  private cacheDuration = 5 * 60 * 1000; // 5 minutes
  
  private receiptsSubject = new BehaviorSubject<Receipt[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  public loading$ = this.loadingSubject.asObservable();
  public receipts$ = this.receiptsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private saveToCache(data: Receipt[], email: string): void {
    try {
      const cacheData: CacheData = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem(`${this.cacheKey}_${email}`, JSON.stringify(cacheData));
      this.receiptsSubject.next(data);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  private getFromCache(email: string): Receipt[] | null {
    try {
      const cached = localStorage.getItem(`${this.cacheKey}_${email}`);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheData.timestamp > this.cacheDuration) {
        localStorage.removeItem(`${this.cacheKey}_${email}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  private fetchFromApi(email: string): Observable<Receipt[]> {
    this.loadingSubject.next(true);
    
    return this.http.get<Receipt[]>(`${this.apiBaseUrl}/receipts?email=${email}`).pipe(
      tap(data => {
        this.saveToCache(data, email);
      }),
      catchError(error => {
        console.error('Error fetching receipts:', error);
        return of([]);
      }),
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  getReceipts(email: string): Observable<Receipt[]> {
    // First check cache
    const cachedData = this.getFromCache(email);
    if (cachedData) {
      this.receiptsSubject.next(cachedData);
      // Fetch in background to update cache
      this.fetchFromApi(email).subscribe();
    } else {
      // If no cache, fetch from API
      this.fetchFromApi(email).subscribe(data => {
        this.receiptsSubject.next(data);
      });
    }

    // Return the subject as an observable
    return this.receipts$;
  }

  forceRefresh(email: string): Observable<Receipt[]> {
    this.clearCache(email);
    return this.fetchFromApi(email);
  }

  clearCache(email: string): void {
    localStorage.removeItem(`${this.cacheKey}_${email}`);
    this.receiptsSubject.next([]);
  }
}