import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';

import { environment } from '../assets/environment';
import { AppInsightsService } from './AppInsightsService';

export interface FamilyInvite {
  inviteId: string;
  familyId: string;
  invitedUserEmail: string;
  invitedBy: string;
  status: string;
  createdAt: Date;
}

interface InitializeFamilyRequest {
  email: string;
  pushToken?: string;
  platform?: string;
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
  private apiUrl = environment.apiUrl+'/api';
  
  private familyState = new BehaviorSubject<FamilyState>({
    familyId: null,
    isInitialized: false
  });

  familyState$ = this.familyState.asObservable();

  constructor(private http: HttpClient, private appInsights: AppInsightsService) {}

  initializeFamily(request: InitializeFamilyRequest): Observable<any> {
    const startTime = Date.now();
    return this.http.post<any>(`${this.apiUrl}/family/initialize`, request).pipe(
      tap(response => {
        // Log successful initialization
        const duration = Date.now() - startTime;
        this.appInsights.logMetric('FamilyInitializeTime', duration, {
          success: true,
          email: request.email
        });
        
        this.appInsights.logEvent('FamilyInitialized', {
          familyId: response.familyId,
          email: request.email
        });

        this.familyState.next({
          familyId: response.familyId,
          isInitialized: true
        });
      }),
      catchError((error: HttpErrorResponse) => {
        this.logError('initializeFamily', error, { 
          email: request.email 
        });
        throw error;
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
    return this.http.get<Family>(`${this.apiUrl}/family/${familyId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logError('getFamilyDetails', error, { familyId });
        throw error;
      })
    );
  }

  getFamilies(email: string): Observable<Family[]> {
    return this.http.get<Family[]>(`${this.apiUrl}/family/byEmail/${email}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logError('getFamilies', error, { email });
        throw error;
      })
    );
  }

  getPendingInvites(email: string): Observable<FamilyInvite[]> {
    return this.http.get<FamilyInvite[]>(`${this.apiUrl}/family/invites/${email}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logError('getPendingInvites', error, { email });
        throw error;
      })
    );
  }

  sendInvite(familyId: string, email: string, invitedBy: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/family/${familyId}/inviteMember`, {
      email,
      invitedBy
    }).pipe(
      tap(() => {
        this.appInsights.logEvent('FamilyInviteSent', {
          familyId,
          invitedEmail: email,
          invitedBy
        });
      }),
      catchError((error: HttpErrorResponse) => {
        this.logError('sendInvite', error, { 
          familyId, 
          email, 
          invitedBy 
        });
        throw error;
      })
    );
  }

  processInvite(inviteId: string, invitedUserEmail: string, action: 'accept' | 'reject'): Observable<any> {
    return this.http.post(`${this.apiUrl}/family/invites/${inviteId}/${invitedUserEmail}/process`, { 
      action 
    }).pipe(
      tap(() => {
        this.appInsights.logEvent('FamilyInviteProcessed', {
          inviteId,
          invitedUserEmail,
          action
        });
      }),
      catchError((error: HttpErrorResponse) => {
        this.logError('processInvite', error, { 
          inviteId, 
          invitedUserEmail, 
          action 
        });
        throw error;
      })
    );
  }

  createFamily(familyName: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/family/create`, {
      familyName,
      email
    }).pipe(
      tap(response => {
        this.appInsights.logEvent('FamilyCreated', {
          familyId: response.id,
          familyName,
          createdBy: email
        });
      }),
      catchError((error: HttpErrorResponse) => {
        this.logError('createFamily', error, { 
          familyName, 
          email 
        });
        throw error;
      })
    );
  }
// Updated logError method with correct logException signature
private logError(methodName: string, error: any, context?: any) {
  // Create a custom error object with additional context
  const customError = new Error(`FamilyService.${methodName} failed: ${error.message}`);
  
  // Store original stack trace if available
  if (error.stack) {
    customError.stack = error.stack;
  }
  
  // Log the exception with the correct signature
  this.appInsights.logException(customError, 3); // Using severity level 3 (Warning)
  
  // Also log as an event with additional context for easier querying
  this.appInsights.logEvent('FamilyServiceError', {
    method: methodName,
    statusCode: error.status,
    statusText: error.statusText,
    url: error.url || 'Unknown URL',
    message: error.message,
    ...context
  });
  
  // Log a detailed trace for debugging
  this.appInsights.logTrace(`Error in ${methodName}`, {
    errorDetails: error.message,
    statusCode: error.status,
    ...context
  });
}
}