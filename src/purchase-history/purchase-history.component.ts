import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common'; 
import { Purchase, PurchaseService } from '../services/purchase.service';
import { Observable } from 'rxjs';
import { UploadComponent } from "../upload/upload.component";
import { HttpClient, HttpClientModule } from '@angular/common/http';  

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgFor, NgIf,UploadComponent,UploadComponent,HttpClientModule,CommonModule],
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
  showUploads:boolean=false;
  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {
    this.purchases$ = this.purchaseService.getPurchases();
  }

  gotouploadspage(){
    this.showUploads=!this.showUploads;
  }
  handleCloseUpload(){
    this.showUploads=false;
  }
}