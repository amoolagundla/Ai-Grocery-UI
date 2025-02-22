import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private apiBaseUrl = 'https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api/family';
  private listsSubject = new BehaviorSubject<any[]>([]);
  public isLoading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  private fetchFromApi(familyId: string): Observable<any> {
    this.isLoading.next(true);
    return this.http.get(`${this.apiBaseUrl}/${familyId}/shoppingLists`).pipe(
      tap(data => this.listsSubject.next(data as any[])),
      catchError(error => {
        console.error('Error fetching shopping lists:', error);
        return EMPTY;
      }),
      finalize(() => this.isLoading.next(false))
    );
  }

  getShoppingLists(familyId: string): Observable<any> {
    // Fetch fresh data and update the subject
    this.fetchFromApi(familyId).subscribe();
    
    // Return the subject that will emit fresh data
    return this.listsSubject.asObservable();
  }

  saveShoppingList(list: any): Observable<any> {
    this.isLoading.next(true);
    return this.http.post(`${this.apiBaseUrl}/${list.familyId}/shoppingLists`, list).pipe(
      tap(response => {
        const currentLists = this.listsSubject.value;
        const updatedLists = [list, ...currentLists];
        this.listsSubject.next(updatedLists);
      }),
      catchError(error => {
        console.error('Error saving shopping list:', error);
        throw error;
      }),
      finalize(() => this.isLoading.next(false))
    );
  }
}