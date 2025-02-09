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
    private user = new BehaviorSubject<User | null>(null);
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
        photoURL: googleUser.picture
      };
      this.user.next(user);
    }
  
    logout(): void {
      this.user.next(null);
    }
}

 