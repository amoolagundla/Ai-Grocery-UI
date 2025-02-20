import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common'; 
import { Purchase, PurchaseService } from '../services/purchase.service';
import { Observable, switchMap } from 'rxjs';
import { UploadComponent } from "../upload/upload.component";
import { HttpClient, HttpClientModule } from '@angular/common/http';  
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [ NgIf,UploadComponent,UploadComponent,HttpClientModule,CommonModule],
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
  showUploads: boolean = false;
  familyId: string | undefined;
  constructor(private purchaseService: PurchaseService, private authService: AuthService) {}

  ngOnInit(): void {
    this.purchases$ = this.authService.user$.pipe(
      switchMap(user => {
        this.familyId = user?.familyId;
        return this.purchaseService.getPurchases(this.familyId);
      })
    );
  }

  gotouploadspage(){
    this.showUploads=!this.showUploads;
  }
  handleCloseUpload(){
    this.showUploads=false;
  }
}