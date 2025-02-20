import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
  selector: 'app-receipts',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule,
    ReactiveFormsModule,
    CachedImageComponent
  ],
  providers: [AuthService, ReceiptsService],
  template: `
    <div class="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
         style='font-family: Manrope, "Noto Sans", sans-serif;'>
      
      <!-- 🔥 Header -->
      <div class="flex items-center bg-white p-4 pb-2 justify-between">
        <h2 class="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">Receipts</h2>
        <div class="flex w-12 items-center justify-end">
          <p class="text-[#637588] text-base font-bold leading-normal tracking-[0.015em] shrink-0">Upload</p>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" 
           class="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" 
           class="flex justify-center items-center p-8">
        <div class="text-gray-500">Loading receipts...</div>
      </div>

      <!-- Receipt List -->
      <div class="flex flex-col">
        <div *ngFor="let receipt of receipts" 
             class="flex items-center gap-4 bg-white px-4 py-3 justify-between cursor-pointer hover:bg-gray-100 border-b" 
             (click)="selectReceipt(receipt)">
          <div class="flex items-center gap-4">
            <div class="bg-center bg-no-repeat aspect-video bg-cover rounded-lg h-14 w-20" 
                 [style.backgroundImage]="'url(' + receipt.blobUrl + ')'">
            </div>
            <div class="flex flex-col justify-center">
              <p class="text-[#111418] text-base font-medium leading-normal line-clamp-1">
                {{ extractStoreName(receipt.receiptText) }}
              </p>
              <p class="text-[#637588] text-sm font-normal leading-normal line-clamp-2">
                {{ extractTotal(receipt.receiptText) | currency }} · 
                {{ parseDateFromText(receipt.receiptText) | date:'MMM d, y' }}
              </p>
            </div>
          </div>
          <div class="shrink-0">
            <a [href]="receipt.blobUrl" 
               download 
               class="text-[#111418] flex size-7 items-center justify-center"
               (click)="$event.stopPropagation()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H72a8,8,0,0,1,0,16H32v64H224V136H184a8,8,0,0,1,0-16h40A16,16,0,0,1,240,136Zm-117.66-2.34a8,8,0,0,0,11.32,0l48-48a8,8,0,0,0-11.32-11.32L136,108.69V24a8,8,0,0,0-16,0v84.69L85.66,74.34A8,8,0,0,0,74.34,85.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z"></path>
              </svg>
            </a>
          </div>
        </div>

        <!-- Load More Button -->
        <div *ngIf="hasMoreResults && !loading" 
             class="p-4 flex justify-center">
          <button (click)="loadMoreReceipts()"
                  [disabled]="loadingMore"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
            {{ loadingMore ? 'Loading...' : 'Load More' }}
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="receipts.length === 0 && !loading" 
             class="text-gray-500 text-center p-8">
          No receipts found.
        </div>
      </div>

      <!-- Receipt Modal -->
      <div *ngIf="selectedReceipt" 
           class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          <!-- Modal Header -->
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold">Receipt Details</h3>
            <button (click)="closePreview()" 
                    class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="flex flex-col md:flex-row gap-4 p-4 overflow-y-auto">
            <!-- Receipt Image -->
            <div class="md:w-1/2">
              <app-cached-image [src]="selectedReceipt.blobUrl" 
                               class="rounded-lg shadow-lg max-h-[60vh] w-full object-contain">
              </app-cached-image>
            </div>

            <!-- Receipt Text -->
            <div class="md:w-1/2 font-mono text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg overflow-y-auto max-h-[60vh]">
              <div class="mb-4">
                <p class="font-bold">{{ extractStoreName(selectedReceipt.receiptText) }}</p>
                <p class="text-gray-500">{{ parseDateFromText(selectedReceipt.receiptText) | date:'MMM d, y h:mm a' }}</p>
              </div>
              
              <div class="space-y-2">
                <ng-container *ngFor="let item of parseReceiptItems(selectedReceipt.receiptText)">
                  <div class="flex justify-between items-start">
                    <span>{{ item.name }}</span>
                    <span class="ml-4">{{ item.price | currency }}</span>
                  </div>
                </ng-container>
              </div>

              <div class="mt-4 pt-4 border-t">
                <div class="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{{ extractTotal(selectedReceipt.receiptText) | currency }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="border-t p-4 flex justify-end gap-2">
            <button (click)="closePreview()" 
                    class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Close
            </button>
            <a [href]="selectedReceipt.blobUrl" 
               download 
               class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecieptsComponent implements OnInit {
  public receipts: Receipt[] = [];
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
        next: (response: any) => {
          if (this.loadingMore) {
            this.receipts = [...this.receipts, ...response.items];
          } else {
            this.receipts = response.items;
          }
          this.continuationToken = response.continuationToken;
          this.hasMoreResults = response.hasMoreResults;
          this.loadingMore = false;
          this.loading = false;
        },
        error: (error: any) => {
          this.errorMessage = 'Error fetching receipts.';
          console.error(error);
          this.loadingMore = false;
          this.loading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  fetchReceipts(): void {
    this.errorMessage = '';
    this.receiptsService.getReceipts(this.userEmail, this.pageSize).subscribe({
      error: (error: any) => {
        this.errorMessage = 'Error fetching receipts.';
        console.error(error);
      }
    });
  }

  loadMoreReceipts(): void {
    if (!this.hasMoreResults || this.loadingMore) return;
    
    this.loadingMore = true;
    this.receiptsService.loadNextPage(
      this.userEmail,
      this.continuationToken,
      this.pageSize
    ).subscribe({
      error: (error: any) => {
        this.errorMessage = 'Error loading more receipts.';
        console.error(error);
        this.loadingMore = false;
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
    const lines = text.split('\n');
    let total = '0.00';

    // Look for total in the receipt text
    for (const line of lines) {
      if (line.toLowerCase().includes('total')) {
        const match = line.match(/\d+\.\d{2}/);
        if (match) {
          total = match[0];
          break;
        }
      }
    }

    return total;
  }
}