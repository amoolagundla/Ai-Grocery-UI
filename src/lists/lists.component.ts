import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ShoppingListService } from '../services/ShoppingListService';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

interface StoreItem {
  store: string;
  item: string;
}

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  providers: [ShoppingListService],
  templateUrl: './lists.component.html',
})
export class ListsComponent implements OnInit {
  shoppingListForm: FormGroup;
  familyId: string | undefined;
  selectedStore: string | null = null;
  previousLists: any[] = [];
  storeItems: { [store: string]: string[] } = {};
  addedItems: Map<string, string> = new Map();
  loading$: any;
  private subscriptions = new Subscription();
  userEmail!: string;

  constructor(
    private fb: FormBuilder,
    private shoppingListService: ShoppingListService,
    private authService: AuthService
  ) {
    this.shoppingListForm = this.fb.group({
      storeName: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loading$ = this.shoppingListService.isLoading;

    // Subscribe to auth service for familyId
    this.subscriptions.add(
      this.authService.user$.subscribe(user => {
        if (user?.familyId) {
          this.familyId = user.familyId;
          this.userEmail = user.email;
          this.loadPreviousLists();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    if (!this.familyId) {
      console.warn('No family ID available');
      return;
    }

    this.subscriptions.add(
      this.shoppingListService.getShoppingLists(this.familyId).subscribe({
        next: (data) => {
          this.previousLists = data[0].StoreItems;
          if (data.length > 0) {
            this.storeItems = data[0].StoreItems;
            if (!this.selectedStore && this.getStoreNames().length > 0) {
              this.filterByStore(this.getStoreNames()[0]);
            }
          }
        },
        error: (err) => {
          console.error('Error fetching shopping lists:', err);
        }
      })
    );
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
    if (!this.familyId) {
      console.error('No family ID available');
      return;
    }

    const groupedItems = this.getGroupedSelectedItems();
    const newList = {
      familyId: this.familyId,
      items: groupedItems,
      createdDate: new Date()
    };

    this.subscriptions.add(
      this.shoppingListService.saveShoppingList(newList).subscribe({
        next: () => {
          alert('Shopping list saved successfully!');
          this.loadPreviousLists();
        },
        error: (err) => {
          console.error('Error saving shopping list:', err);
          alert('Failed to save shopping list.');
        }
      })
    );
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