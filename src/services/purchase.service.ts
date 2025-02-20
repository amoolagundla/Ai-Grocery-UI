// src/app/services/purchase.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Purchase {
  id: string;
  store: string;
  date: Date;
  items: PurchaseItem[];
  total: number;
}

export interface PurchaseItem {
  name: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private mockPurchases: Purchase[] = [
    {
      id: '1',
      store: 'Costco',
      date: new Date('2024-02-01'),
      items: [
        { name: 'Paper Towels', quantity: 2, price: 19.99 },
        { name: 'Chicken Breast', quantity: 1, price: 24.99 }
      ],
      total: 64.97
    },
    {
      id: '2',
      store: 'Costco',
      date: new Date('2024-02-05'),
      items: [
        { name: 'TV', quantity: 1, price: 499.99 },
        { name: 'Pizza', quantity: 2, price: 9.99 }
      ],
      total: 519.97
    }
  ];

  getPurchases(familyId?: string): Observable<Purchase[]> {
    return of(this.mockPurchases);
  }
}