// src/app/services/family.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs'; 

export interface FamilyInvite {
  inviteId: string;
  familyId: string;
  invitedUserEmail: string;
  invitedBy: string;
  status: string;
  createdAt: Date;
}

export interface Family {
   Id: string;
  familyName: string;
  primaryEmail: string;
}
export interface FamilyState {
    familyId: string | null;
    isInitialized: boolean;
  }
@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private apiUrl ="https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api";  
  private familyState = new BehaviorSubject<FamilyState>({
    familyId: null,
    isInitialized: false
  });

  familyState$ = this.familyState.asObservable();

  constructor(private http: HttpClient) {}

  initializeFamily(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/family/initialize`, { email }).pipe(
      tap(response => {
        this.familyState.next({
          familyId: response.familyId,
          isInitialized: true
        });
      })
    );
  }

  getFamilyId(): string | null {
    return this.familyState.value.familyId;
  }

  isInitialized(): boolean {
    return this.familyState.value.isInitialized;
  }
  getFamilyDetails(familyId: string): Observable<Family> {
    return this.http.get<Family>(`${this.apiUrl}/family/${familyId}`);
  }

  getFamilies(email: string): Observable<Family[]> {
    return this.http.get<Family[]>(`${this.apiUrl}/family/byEmail/${email}`);
  }

  getPendingInvites(email: string): Observable<FamilyInvite[]> {
    return this.http.get<FamilyInvite[]>(`${this.apiUrl}/family/invites/${email}`);
  }

  sendInvite(familyId: string, email: string, invitedBy: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/family/${familyId}/inviteMember`, {
      email,
      invitedBy
    });
  }

  processInvite(inviteId: string,invitedUserEmail:string, action: 'accept' | 'reject'): Observable<any> {
    return this.http.post(`${this.apiUrl}/family/invites/${inviteId}/${invitedUserEmail}/process`, { action });
  }

  createFamily(familyName: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/family/create`, {
      familyName,
      email
    });
  }
}