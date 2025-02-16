import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
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

    localStorage.setItem('user', JSON.stringify(user));  // ✅ Save to localStorage
    this.user.next(user);
  }

  /** ✅ Retrieve stored user from localStorage */
  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  /** ✅ Clear user data on logout */
  public logout(): void {
    localStorage.removeItem('user');  // ✅ Remove from localStorage
    this.user.next(null);
  }
}
