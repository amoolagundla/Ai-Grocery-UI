import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ShoppingListService } from '../services/ShoppingListService';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-lists',
  imports: [ReactiveFormsModule,CommonModule,HttpClientModule],
  providers:[ShoppingListService],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css'
})
export class ListsComponent {
  shoppingListForm: FormGroup;
  familyId: string = '1';
  selectedStore: string | null = null;
  previousLists: any[] = [];
  storeItems: any = {}; // To store all store items
  addedItems: Set<string> = new Set(); // Track added items

  constructor(private fb: FormBuilder, private shoppingListService: ShoppingListService) {
    this.shoppingListForm = this.fb.group({
      storeName: [''],
      items: this.fb.array([]),
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
          this.storeItems = data[0].storeItems; // Assuming single user scenario
          this.filterByStore(this.getStoreNames()[0])
        }
      },
      error: (err) => {
        console.error('Error fetching shopping lists:', err);
        alert('Failed to load shopping lists.');
      },
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
}
