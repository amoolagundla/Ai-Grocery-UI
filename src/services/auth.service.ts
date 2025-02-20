import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  familyId?: string;  // Added familyId
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user = new BehaviorSubject<User | null>(this.getStoredUser());
  user$ = this.user.asObservable();

  constructor() {}

  /** ✅ Check if user is logged in */
  isLoggedIn(): boolean {
    return !!this.user.value;
  }

  /** ✅ Store user in BehaviorSubject and persist in localStorage */
  setUser(googleUser: any): void {
    const user: User = {
      id: googleUser.sub,
      name: googleUser.name,
      email: googleUser.email,
      photoURL: googleUser.picture
    };

    localStorage.setItem('user', JSON.stringify(user));
    this.user.next(user);
  }

  /** ✅ Update user's family ID */
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

  /** ✅ Get user's family ID */
  getFamilyId(): string | undefined {
    return this.user.value?.familyId;
  }

  /** ✅ Retrieve stored user from localStorage */
  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  /** ✅ Clear user data on logout */
  public logout(): void {
    localStorage.removeItem('user');
    this.user.next(null);
  }
}