import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, EMPTY } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

interface CacheData {
  timestamp: number;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private apiBaseUrl = 'https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api/family';
  private cacheKey = 'shopping_lists_cache';
  private listsSubject = new BehaviorSubject<any[]>([]);
  public isLoading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  private saveToCache(data: any, familyId: string): void {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(`${this.cacheKey}_${familyId}`, JSON.stringify(cacheData));
    this.listsSubject.next(data);
  }
 

  private getFromCache(familyId: string): any[] | null {
    try {
      const cached = localStorage.getItem(`${this.cacheKey}_${familyId}`);
      if (!cached) return null;
      const cacheData: CacheData = JSON.parse(cached);
      return cacheData.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  private fetchFromApi(familyId: string): Observable<any> {
    this.isLoading.next(true);
    return this.http.get(`${this.apiBaseUrl}/${familyId}/shoppingLists`).pipe(
      tap(data => this.saveToCache(data, familyId)),
      catchError(error => {
        console.error('Error fetching shopping lists:', error);
        return EMPTY;
      }),
      finalize(() => this.isLoading.next(false))
    );
  }

  getShoppingLists(familyId: string): Observable<any> {
    // Immediately return cached data if available
    const cachedData = this.getFromCache(familyId);
    if (cachedData) {
      this.listsSubject.next(cachedData);
    }

    // Always fetch fresh data in the background
    this.fetchFromApi(familyId).subscribe();

    // Return the subject that will emit both cached and fresh data
    return this.listsSubject.asObservable();
  }

  saveShoppingList(list: any): Observable<any> {
    this.isLoading.next(true);
    return this.http.post(`${this.apiBaseUrl}/${list.familyId}/shoppingLists`, list).pipe(
      tap(response => {
        const currentLists = this.listsSubject.value;
        const updatedLists = [list, ...currentLists];
        this.saveToCache(updatedLists, list.familyId);
      }),
      catchError(error => {
        console.error('Error saving shopping list:', error);
        throw error;
      }),
      finalize(() => this.isLoading.next(false))
    );
  }

  clearCache(familyId: string): void {
    localStorage.removeItem(`${this.cacheKey}_${familyId}`);
    this.listsSubject.next([]);
  }
}