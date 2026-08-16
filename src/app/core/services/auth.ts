import {
  HttpClient
} from '@angular/common/http';

import {
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  AuthUser,
  LoginRequest,
  LoginResponse
} from '../../features/auth/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /*
  |--------------------------------------------------------------------------
  | Dependencies
  |--------------------------------------------------------------------------
  */

  private readonly http =
    inject(HttpClient);

  private readonly router =
    inject(Router);

  /*
  |--------------------------------------------------------------------------
  | Configuration
  |--------------------------------------------------------------------------
  */

  private readonly api =
    environment.apiUrl;

  /*
  |--------------------------------------------------------------------------
  | Storage Keys
  |--------------------------------------------------------------------------
  */

  private readonly tokenKey =
    'erp_token';

  private readonly userKey =
    'erp_user';

  /*
  |--------------------------------------------------------------------------
  | Current User
  |--------------------------------------------------------------------------
  */

  private readonly currentUser =
    signal<AuthUser | null>(
      this.getStoredUser()
    );

  readonly user =
    this.currentUser.asReadonly();

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  login(
    credentials: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.api}/auth/login`,
        credentials
      )
      .pipe(

        tap(response => {

          this.setSession(response);

        })

      );

  }

  /*
  |--------------------------------------------------------------------------
  | Forgot Password
  |--------------------------------------------------------------------------
  */

  forgotPassword(
    email: string
  ): Observable<unknown> {

    return this.http.post(
      `${this.api}/auth/forgot-password`,
      {
        email
      }
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Reset Password
  |--------------------------------------------------------------------------
  */

  resetPassword(
    token: string,
    password: string
  ): Observable<unknown> {

    return this.http.post(
      `${this.api}/auth/reset-password/${token}`,
      {
        password
      }
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Save Token
  |--------------------------------------------------------------------------
  */

  saveToken(
    token: string
  ): void {

    localStorage.setItem(
      this.tokenKey,
      token
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Get Token
  |--------------------------------------------------------------------------
  */

  getToken(): string | null {

    return localStorage.getItem(
      this.tokenKey
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  isAuthenticated(): boolean {

    return !!this.getToken();

  }

  isLoggedIn(): boolean {

    return this.isAuthenticated();

  }

  /*
  |--------------------------------------------------------------------------
  | Role
  |--------------------------------------------------------------------------
  */

  hasRole(
    role: string
  ): boolean {

    return this.user()?.role === role;

  }

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  logout(): void {

    this.clearSession();

    this.router.navigate([
      '/login'
    ]);

  }

  /*
  |--------------------------------------------------------------------------
  | Set Session
  |--------------------------------------------------------------------------
  */

  private setSession(
    response: LoginResponse
  ): void {

    this.saveToken(
      response.accessToken
    );

    localStorage.setItem(
      this.userKey,
      JSON.stringify(response.user)
    );

    this.currentUser.set(
      response.user
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Clear Session
  |--------------------------------------------------------------------------
  */

  private clearSession(): void {

    localStorage.removeItem(
      this.tokenKey
    );

    localStorage.removeItem(
      this.userKey
    );

    this.currentUser.set(
      null
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Get Stored User
  |--------------------------------------------------------------------------
  */

  private getStoredUser(): AuthUser | null {

    const storedUser =
      localStorage.getItem(
        this.userKey
      );

    if (!storedUser) {

      return null;

    }

    try {

      return JSON.parse(
        storedUser
      ) as AuthUser;

    } catch {

      localStorage.removeItem(
        this.userKey
      );

      return null;

    }

  }

}
