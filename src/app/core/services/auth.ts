import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private http = inject(HttpClient);

  private api = environment.apiUrl;

  login(data: any) {
    return this.http.post(
      `${this.api}/auth/login`,
      data
    );

  }

  saveToken(token: string) {

    localStorage.setItem("token", token);

  }
  getToken() {

    return localStorage.getItem("token");

  }



  logout(){

    localStorage.removeItem("token");

}
isLoggedIn(){

    return !!this.getToken();

}
forgotPassword(email: string) {
  return this.http.post(
    `${environment.apiUrl}/auth/forgot-password`,
    { email }
  );
}

resetPassword(token: string, password: string) {
  return this.http.post(
    `${environment.apiUrl}/auth/reset-password/${token}`,
    { password }
  );
}
}
