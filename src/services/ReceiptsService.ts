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

export interface PaginatedResponse {
  items: Receipt[];
  continuationToken: string;
  pageSize: number;
  hasMoreResults: boolean;
}

interface CacheData {
  timestamp: number;
  data: PaginatedResponse;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptsService {
  private apiBaseUrl = 'https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api';
  private cacheKey = 'receipts_cache';
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  private receiptsSubject = new BehaviorSubject<PaginatedResponse>({
    items: [],
    continuationToken: '',
    pageSize: 10,
    hasMoreResults: false
  });
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();
  public receipts$ = this.receiptsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private saveToCache(data: PaginatedResponse, email: string): void {
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

  private getFromCache(email: string): PaginatedResponse | null {
    try {
      const cached = localStorage.getItem(`${this.cacheKey}_${email}`);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheData.timestamp > this.cacheDuration) {
        console.warn('Cache expired, fetching fresh data...');
        localStorage.removeItem(`${this.cacheKey}_${email}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  private fetchFromApi(email: string, pageSize: number = 10, continuationToken?: string): Observable<PaginatedResponse> {
    this.loadingSubject.next(true);
    
    let url = `${this.apiBaseUrl}/receipts?email=${email}&pageSize=${pageSize}`;
    if (continuationToken) {
      url += `&continuationToken=${encodeURIComponent(continuationToken)}`;
    }

    return this.http.get<PaginatedResponse>(url).pipe(
      tap(data => {
        if (!continuationToken) {
          // Only cache the first page
          this.saveToCache(data, email);
        }
      }),
      catchError(error => {
        console.error('Error fetching receipts:', error);
        return of({
          items: [],
          continuationToken: '',
          pageSize: pageSize,
          hasMoreResults: false
        });
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getReceipts(email: string, pageSize: number = 10): Observable<PaginatedResponse> {
    const cachedData = this.getFromCache(email);

    if (cachedData && !this.loadingSubject.value) {
      this.receiptsSubject.next(cachedData);
      console.info('Loaded receipts from cache');

      // Fetch in the background but don't block UI
      this.fetchFromApi(email, pageSize).subscribe();
    } else {
      console.warn('No cache found, fetching from API...');
      this.fetchFromApi(email, pageSize).subscribe(
        data => this.receiptsSubject.next(data)
      );
    }

    return this.receipts$;
  }

  loadNextPage(email: string, continuationToken: string, pageSize: number = 10): Observable<PaginatedResponse> {
    return this.fetchFromApi(email, pageSize, continuationToken);
  }

  forceRefresh(email: string, pageSize: number = 10): Observable<PaginatedResponse> {
    console.info('Forcing refresh: Clearing cache and fetching fresh data');
    this.clearCache(email);
    return this.fetchFromApi(email, pageSize);
  }

  clearCache(email: string): void {
    console.warn('Cache cleared');
    localStorage.removeItem(`${this.cacheKey}_${email}`);
    this.receiptsSubject.next({
      items: [],
      continuationToken: '',
      pageSize: 10,
      hasMoreResults: false
    });
  }
}