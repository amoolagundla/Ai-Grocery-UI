import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root' 
})
export class ShoppingListService {
  private apiBaseUrl = 'https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api/family';

  constructor(private http: HttpClient) {}

  saveShoppingList(list: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/${list.familyId}/shoppingLists`, list);
  }

  getShoppingLists(familyId: string): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/${familyId}/shoppingLists`);
  }
}
