import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  familyId?: string;
  idToken?: string;  // Added for Google ID token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user = new BehaviorSubject<User | null>(this.getStoredUser());
  user$ = this.user.asObservable();

  constructor() {}

  isLoggedIn(): boolean {
    return !!this.user.value;
  }

  setUser(googleUser: any): void {
    const user: User = {
      id: googleUser.sub,
      name: googleUser.name,
      email: googleUser.email,
      photoURL: googleUser.picture,
      idToken: googleUser.credential || googleUser.authentication?.idToken // Handle both web and mobile tokens
    };

    localStorage.setItem('user', JSON.stringify(user));
    this.user.next(user);
  }

  getAuthToken(): string | null {
    return this.user.value?.idToken || null;
  }

  setFamilyId(familyId: string): void {
    const currentUser = this.user.value;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        familyId
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.user.next(updatedUser);
    }
  }

  getFamilyId(): string | undefined {
    return this.user.value?.familyId;
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  public logout(): void {
    localStorage.removeItem('user');
    this.user.next(null);
  }
}