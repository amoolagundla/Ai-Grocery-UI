import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ReceiptsService } from '../services/ReceiptsService';
import { CachedImageComponent } from "../components/image-cache/CachedImageComponent";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

interface Receipt {
  id: string;
  userId: string;
  familyId: string;
  receiptText: string;
  storeName: string;
  blobUrl: string;
  createdAt: string;
}

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule,
    ReactiveFormsModule,
    CachedImageComponent
  ],
  providers: [AuthService, ReceiptsService],
  templateUrl: './reciepts.component.html',
})
export class RecieptsComponent implements OnInit {
  public receipts: Receipt[] = [];
  public filteredReceipts: Receipt[] = [];
  public searchControl = new FormControl('');
  selectedReceipt: Receipt | null = null;
  loading: boolean = true;
  loadingMore: boolean = false;
  errorMessage: string = '';
  userEmail!: string;
  loading$: any;
  hasMoreResults: boolean = false;
  continuationToken: string = '';
  pageSize: number = 10;
  private subscriptions = new Subscription();

  constructor(
    private auth: AuthService,
    private receiptsService: ReceiptsService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.receiptsService.loading$;
    
    // Subscribe to auth user changes
    this.subscriptions.add(
      this.auth.user$.subscribe(user => {
        if (user) {
          this.userEmail = user.email;
          this.loadInitialReceipts();
        }
      })
    );

    // Subscribe to search input changes
    this.subscriptions.add(
      this.searchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.filterReceipts(searchTerm || '');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  filterReceipts(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredReceipts = this.receipts;
      return;
    }

    searchTerm = searchTerm.toLowerCase();
    this.filteredReceipts = this.receipts.filter(receipt => 
      receipt.storeName.toLowerCase().includes(searchTerm) ||
      receipt.receiptText.toLowerCase().includes(searchTerm)
    );
  }

  loadInitialReceipts(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.receiptsService.getReceipts(this.userEmail, this.pageSize)
      .subscribe({
        next: (response: any) => {
          this.receipts = response.items;
          this.filteredReceipts = response.items;
          this.continuationToken = response.continuationToken;
          this.hasMoreResults = response.hasMoreResults;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error fetching receipts.';
          console.error(error);
          this.loading = false;
        }
      });
  }

  loadMoreReceipts(): void {
    if (!this.hasMoreResults || this.loadingMore || !this.continuationToken) {
      return;
    }

    this.loadingMore = true;
    this.errorMessage = '';

    this.receiptsService.loadNextPage(
      this.userEmail,
      this.continuationToken,
      this.pageSize
    ).subscribe({
      next: (response: any) => {
        this.receipts = [...this.receipts, ...response.items];
        // Re-apply current search filter to include new items
        this.filterReceipts(this.searchControl.value || '');
        this.continuationToken = response.continuationToken;
        this.hasMoreResults = response.hasMoreResults;
        this.loadingMore = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading more receipts.';
        console.error(error);
        this.loadingMore = false;
      }
    });
  }

  parseDateFromText(text: string): Date {
    // Look for date patterns in the text
    const datePatterns = [
      /(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/,  // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,    // YYYY/MM/DD
      /(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})/ // DD MMM YYYY
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch (e) {
          console.warn('Error parsing date:', e);
        }
      }
    }

    return new Date(); // Return current date if no valid date found
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

  parseReceiptItems(text: string): Array<{name: string, price: string}> {
    const lines = text.split('\n');
    const items: Array<{name: string, price: string}> = [];
    
    const priceRegex = /\d+\.\d{2}/;
    
    for (const line of lines) {
      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        const price = priceMatch[0];
        const name = line.replace(price, '').trim();
        
        if (!line.toLowerCase().includes('total') && 
            !line.toLowerCase().includes('tax') && 
            !line.toLowerCase().includes('subtotal')) {
          items.push({
            name: name.replace(/[A-Z]\s*$/, '').trim(),
            price: price
          });
        }
      }
    }
    
    return items;
  }

  extractTotal(text: string): string {
    const totalPattern = /(?:total|grand total|amount due)[^\d]*(\d+\.\d{2})/i;
    const match = text.match(totalPattern);
    return match ? match[1] : '0.00';
  }
}