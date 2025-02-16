import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ReceiptsService } from '../services/ReceiptsService';
import { CachedImageComponent } from "../components/image-cache/CachedImageComponent";
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
interface Receipt {
  id: string;
  userId: string;
  familyId: string;
  receiptText: string;
  blobUrl: string;
  createdAt: string;
}
@Component({
  selector: 'app-reciepts',
  imports: [
    CommonModule, 
    HttpClientModule,
    ReactiveFormsModule,
    CachedImageComponent
],
  providers: [AuthService, ReceiptsService],
  templateUrl: './reciepts.component.html',
  styleUrl: './reciepts.component.css'
})
export class RecieptsComponent implements OnInit {
  public receipts: Receipt[] = [];
  selectedReceipt: Receipt | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  userEmail!: string;
  loading$:any;
  private subscriptions = new Subscription();

  constructor(
    private auth: AuthService,
    private receiptsService: ReceiptsService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.receiptsService.loading$;
    this.subscriptions.add(
      this.auth.user$.subscribe(user => {
        if (user) {
          this.userEmail = user.email;
          this.fetchReceipts();
        }
      })
    );

    this.subscriptions.add(
      this.receiptsService.receipts$.subscribe({
        next: (data:any) => {
          this.receipts = data;
        },
        error: (error:any) => {
          this.errorMessage = 'Error fetching receipts.';
          console.error(error);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchReceipts(): void {
    this.errorMessage = '';
    this.receiptsService.getReceipts(this.userEmail).subscribe({
      error: (error:any) => {
        this.errorMessage = 'Error fetching receipts.';
        console.error(error);
      }
    });
  }

  refreshReceipts(): void {
    this.errorMessage = '';
    this.receiptsService.forceRefresh(this.userEmail).subscribe({
      error: (error:any) => {
        this.errorMessage = 'Error refreshing receipts.';
        console.error(error);
      }
    });
  }

  selectReceipt(receipt: Receipt): void {
    this.selectedReceipt = receipt;
  }

  closePreview(): void {
    this.selectedReceipt = null;
  }

  extractStoreName(text: string): string {
    const lines = text.split('\n');
    return lines[0] || 'Unknown Store';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  parseReceiptItems(text: string): Array<{name: string, price: string}> {
    const lines = text.split('\n');
    const items: Array<{name: string, price: string}> = [];
    
    const priceRegex = /\d+\.\d{2}/;
    
    for (const line of lines) {
      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        const price = priceMatch[0];
        const name = line.replace(price, '').trim();
        
        // Filter out non-item lines (total, tax, etc.)
        if (!line.toLowerCase().includes('total') && 
            !line.toLowerCase().includes('tax') && 
            !line.toLowerCase().includes('subtotal')) {
          items.push({
            name: name.replace(/[A-Z]\s*$/, '').trim(), // Remove single letter at end (usually category)
            price: price
          });
        }
      }
    }
    
    return items;
  }

  extractTotal(text: string): string {
    const totalMatch = text.match(/TOTAL\s+(\d+\.\d{2})/);
    return totalMatch ? totalMatch[1] : '0.00';
  }
}
