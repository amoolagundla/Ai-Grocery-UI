import { Component, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common'; 
import { Purchase, PurchaseService } from '../services/purchase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgFor, NgIf],
  templateUrl:  './purchase-history.component.html',
  styles: [`
    .purchase-history {
      padding: 2rem;
    }
    .purchase-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .purchase-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .items {
      margin-bottom: 1rem;
    }
    .item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .total {
      font-weight: bold;
      text-align: right;
    }
  `]
})
export class PurchaseHistoryComponent implements OnInit {
  purchases$!: Observable<Purchase[] | null>; 

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {
    this.purchases$ = this.purchaseService.getPurchases();
  }
}