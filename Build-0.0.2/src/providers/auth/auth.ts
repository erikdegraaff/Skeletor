import { Injectable } from '@angular/core';

@Injectable()
export class AuthProvider {

  constructor() {

  }

  getUser() {
    return localStorage.getItem('user');
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
}
