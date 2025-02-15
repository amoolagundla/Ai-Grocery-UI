import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ShoppingListService } from '../services/ShoppingListService';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

interface StoreItem {
  store: string;
  item: string;
}

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
            <p class="text-[#111418] text-sm font-medium leading-normal"
               [class.text-white]="selectedStore === store">
               {{ store }}
            </p>
          </div>
        </div>

        <!-- Current Store Items -->
        <div *ngIf="selectedStore" class="px-4 py-2">
          <h2 class="text-[#111418] text-lg font-bold mb-4">
            {{ selectedStore }}
          </h2>
          
          <div *ngFor="let item of getItemsFromStore()" class="mb-2">
            <label class="flex gap-x-3 py-3 flex-row-reverse justify-between items-center cursor-pointer">
              <input
                type="checkbox"
                [checked]="isItemAdded(item)"
                (change)="toggleItem(item)"
                class="h-5 w-5 rounded border-[#dce0e5] border-2 bg-transparent text-[#1980e6] 
                       checked:bg-[#1980e6] checked:border-[#1980e6] checked:bg-[image:--checkbox-tick-svg] 
                       focus:ring-0 focus:ring-offset-0 focus:border-[#dce0e5] focus:outline-none"
              />
              <span class="text-[#111418] text-base font-normal leading-normal flex-grow">{{ item }}</span>
            </label>
          </div>
        </div>

        <!-- Selected Items Summary -->
        <div *ngIf="getSelectedItemsCount() > 0" class="mt-6 px-4">
          <h3 class="text-[#111418] text-lg font-semibold mb-3">Selected Items</h3>
          <div *ngFor="let storeGroup of getGroupedSelectedItems() | keyvalue" class="mb-4">
            <div class="font-medium text-[#111418] mb-2">🏪 {{ storeGroup.key }}</div>
            <div *ngFor="let item of storeGroup.value" class="ml-4 text-[#637588]">
              - {{ item }}
            </div>
          </div>
        </div>
      </div>

      <!-- Share Button -->
      <button 
        (click)="shareToWhatsApp()"
        class="fixed bottom-2 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
        style="z-index: 100000; margin-bottom: 31%;"
        aria-label="Share to WhatsApp"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
  storeItems: { [store: string]: string[] } = {};
  addedItems: Map<string, string> = new Map(); // key: item, value: store

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
      if (this.selectedStore) {
        this.addedItems.set(item, this.selectedStore);
        console.log(`Added: ${item} from ${this.selectedStore}`);
      }
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

  isItemAdded(item: string): boolean {
    return this.addedItems.has(item);
  }

  getSelectedItemsCount(): number {
    return this.addedItems.size;
  }

  getGroupedSelectedItems(): { [store: string]: string[] } {
    const grouped: { [store: string]: string[] } = {};
    
    this.addedItems.forEach((store, item) => {
      if (!grouped[store]) {
        grouped[store] = [];
      }
      grouped[store].push(item);
    });
    
    return grouped;
  }

  saveShoppingList(): void {
    const groupedItems = this.getGroupedSelectedItems();
    const newList = {
      familyId: this.familyId,
      items: groupedItems,
      createdDate: new Date()
    };

    this.shoppingListService.saveShoppingList(newList).subscribe({
      next: () => {
        alert('Shopping list saved successfully!');
        this.loadPreviousLists();
      },
      error: (err) => {
        console.error('Error saving shopping list:', err);
        alert('Failed to save shopping list.');
      }
    });
  }

  shareToWhatsApp() {
    const groupedItems = this.getGroupedSelectedItems();
    let message = "Shopping List\n\n";
    
    Object.entries(groupedItems).forEach(([store, items]) => {
      message += `🏪 ${store}:\n`;
      items.forEach(item => {
        message += `- ${item}\n`;
      });
      message += '\n';
    });

    message += `\nCreated: ${new Date().toLocaleDateString()}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}