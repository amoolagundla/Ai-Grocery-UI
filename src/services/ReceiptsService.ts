import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../assets/environment';

export interface Receipt {
  id: string;
  userId: string;
  familyId: string;
  receiptText: string;
  blobUrl: string;
  createdAt: string;
}

export interface PaginatedResponse {
  items: Receipt[];
  continuationToken: string;
  pageSize: number;
  hasMoreResults: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptsService {
  private apiBaseUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getReceipts(email: string, pageSize: number = 10): Observable<PaginatedResponse> {
    this.loadingSubject.next(true);
    const url = `${this.apiBaseUrl}/receipts?email=${email}&pageSize=${pageSize}`;
    
    return this.http.get<PaginatedResponse>(url).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  loadNextPage(email: string, continuationToken: string, pageSize: number = 10): Observable<PaginatedResponse> {
    this.loadingSubject.next(true);
    const encodedToken = encodeURIComponent(continuationToken);
    const url = `${this.apiBaseUrl}/receipts?email=${email}&pageSize=${pageSize}&continuationToken=${encodedToken}`;
    
    return this.http.get<PaginatedResponse>(url).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }
}