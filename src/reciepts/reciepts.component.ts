import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
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
    CommonModule,HttpClientModule  // ✅ Ensures date pipe is available
  ],
  providers:[AuthService],
  templateUrl: './reciepts.component.html',
  styleUrl: './reciepts.component.css'
})
export class RecieptsComponent implements OnInit {
  public receipts: Receipt[] = [];
  selectedReceipt: Receipt | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  userEmail!: string;

  constructor(private http: HttpClient,private auth:AuthService) {}

  ngOnInit(): void {
   
    this.auth.user$.subscribe(user => {
      if (user) {
        this.userEmail = user.email;
        this.fetchReceipts();
      }
    });
  }

  fetchReceipts(): void {
    this.http.get<Receipt[]>('https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api/receipts?email='+ this.userEmail)
      .subscribe({
        next: (data) => {
          this.receipts = data;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error fetching receipts.';
          this.loading = false;
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
}
