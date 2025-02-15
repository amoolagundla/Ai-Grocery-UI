import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ShoppingListService } from '../services/ShoppingListService';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  providers: [ShoppingListService],
  template: `
    <div class="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden">
      <div>
        <!-- Store Filter Section -->
        <div class="flex gap-3 p-5 overflow-x-auto">
          <div
            *ngFor="let store of getStoreNames()"
            class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f0f2f4] pl-4 pr-4 cursor-pointer"
            [class.bg-blue-500]="selectedStore === store"
            (click)="filterByStore(store)"
          >
            <p class="text-[#111418] text-sm font-medium leading-normal">{{ store }}</p>
          </div>
        </div>

        <!-- Shopping List Form -->
        <form [formGroup]="shoppingListForm">
          

          <div class="px-4">
            <div formArrayName="items" class="p-5">
              <div *ngFor="let item of getItemsFromStore(); let i = index">
                <label class="flex gap-x-3 py-3 flex-row-reverse justify-between">
                  <input
                    type="checkbox"
                    [checked]="addedItems.has(item)"
                    (change)="toggleItem(item)"
                    class="h-5 w-5 rounded border-[#dce0e5] border-2 bg-transparent text-[#1980e6] checked:bg-[#1980e6] checked:border-[#1980e6] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce0e5] focus:outline-none"
                  />
                  <div class="flex items-center gap-4">
                     
                    <p class="text-[#111418] text-base font-normal leading-normal">{{ item }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>

       
      </div>
      <button 
        (click)="shareViaWebShare()"
        class="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style="z-index: 100000; margin-bottom: 31%;" aria-label="Share shopping list"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>
    </div>
  `
})
export class ListsComponent implements OnInit {
  shoppingListForm: FormGroup;
  familyId: string = '1';
  selectedStore: string | null = null;
  previousLists: any[] = [];
  storeItems: any = {}; // To store all store items
  addedItems: Set<string> = new Set(); // Track added items

  constructor(
    private fb: FormBuilder,
    private shoppingListService: ShoppingListService
  ) {
    this.shoppingListForm = this.fb.group({
      storeName: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadPreviousLists();
  }

  get items(): FormArray {
    return this.shoppingListForm.get('items') as FormArray;
  }

  toggleItem(item: string): void {
    if (this.addedItems.has(item)) {
      this.addedItems.delete(item);
      console.log(`Removed: ${item}`);
    } else {
      this.addedItems.add(item);
      console.log(`Added: ${item}`);
    }
  }

  async loadPreviousLists(): Promise<void> {
    this.shoppingListService.getShoppingLists(this.familyId).subscribe({
      next: (data) => {
        this.previousLists = data;
        if (data.length > 0) {
          this.storeItems = data[0].storeItems;
          this.filterByStore(this.getStoreNames()[0]);
        }
      },
      error: (err) => {
        console.error('Error fetching shopping lists:', err);
        alert('Failed to load shopping lists.');
      }
    });
  }

  getStoreNames(): string[] {
    return Object.keys(this.storeItems || {});
  }

  getItemsFromStore(): string[] {
    return this.selectedStore ? this.storeItems[this.selectedStore] || [] : [];
  }

  filterByStore(store: string): void {
    this.selectedStore = store;
  }

  // Add method to save shopping list
  saveShoppingList(): void {
    const selectedItems = Array.from(this.addedItems);
    const newList = {
      familyId: this.familyId,
      storeName: this.selectedStore,
      items: selectedItems,
      createdDate: new Date()
    };

    this.shoppingListService.saveShoppingList(newList).subscribe({
      next: () => {
        alert('Shopping list saved successfully!');
        this.loadPreviousLists(); // Refresh the lists
      },
      error: (err) => {
        console.error('Error saving shopping list:', err);
        alert('Failed to save shopping list.');
      }
    });
  }

  shareViaWebShare() {
    const items = Array.from(this.addedItems);
    
    // Create message with store name if selected
    const storeInfo = this.selectedStore ? `From ${this.selectedStore}:\n` : '';
    const message = `Shopping List\n${storeInfo}- ${items.join('\n- ')}`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp URL
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;

    // Open in new tab
    window.open(whatsappUrl, '_blank');
  }


}