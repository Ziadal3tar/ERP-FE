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




  private readonly http =
    inject(HttpClient);


  private readonly router =
    inject(Router);




  private readonly api =
    environment.apiUrl;




  private readonly tokenKey =
    'erp_token';


  private readonly userKey =
    'erp_user';




  private readonly currentUser =
    signal<AuthUser | null>(
      this.getStoredUser()
    );


  readonly user =
    this.currentUser.asReadonly();




  login(
    credentials: LoginRequest
  ): Observable<LoginResponse> {

    return this.http

      .post<LoginResponse>(
        `${this.api}/auth/login`,
        credentials
      )

      .pipe(

        tap(
          response => {

            this.setSession(
              response
            );

          }
        )

      );

  }




  // getProfile():
  //   Observable<{
  //     success: boolean;
  //     user: AuthUser;
  //   }> {

  //   return this.http.get<{
  //     success: boolean;
  //     user: AuthUser;
  //   }>(
  //     `${this.api}/auth/profile`
  //   );

  // }




  refreshUser():
    Observable<{
      success: boolean;
      user: AuthUser;
    }> {

    return this.getProfile()

      .pipe(

        tap(
          response => {

            this.setUser(
              response.user
            );

          }
        )

      );

  }




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




  saveToken(
    token: string
  ): void {

    localStorage.setItem(
      this.tokenKey,
      token
    );

  }




  getToken(): string | null {

    return localStorage.getItem(
      this.tokenKey
    );

  }




  isAuthenticated(): boolean {

    return !!this.getToken();

  }


  isLoggedIn(): boolean {

    return this.isAuthenticated();

  }




  hasRole(
    role: string
  ): boolean {

    return this.user()?.role === role;

  }




  logout(): void {

    this.http

      .post<{
        success: boolean;
        message: string;
      }>(
        `${this.api}/auth/logout`,
        {}
      )

      .pipe()

      .subscribe({

        next: () => {

          this.finishLogout();

        },

        error: error => {

          /*
           * Even if the backend request fails,
           * we still clear the local session.
           */

          console.error(
            'Logout error:',
            error
          );

          this.finishLogout();

        }

      });

  }




  private setSession(
    response: LoginResponse
  ): void {

    this.saveToken(
      response.accessToken
    );


    this.setUser(
      response.user
    );

  }




 private setUser(
  user: AuthUser
): void {

  localStorage.setItem(
    this.userKey,
    JSON.stringify(user)
  );

  this.currentUser.set(
    user
  );

}




  private finishLogout(): void {

    this.clearSession();


    this.router.navigate([
      '/login'
    ]);

  }




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




  private getStoredUser():
    AuthUser | null {

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
getProfile(): Observable<{
  success: boolean;
  user: AuthUser;
}> {

  return this.http.get<{
    success: boolean;
    user: AuthUser;
  }>(
    `${this.api}/auth/profile`
  );

}
updateProfile(
  data: {
    name?: string;
    phone?: string;
    avatar?: string;
  }
):
  Observable<{
    success: boolean;
    message: string;
    data?: AuthUser;
    user?: AuthUser;
  }> {

  return this.http

    .put<{
      success: boolean;
      message: string;
      data?: AuthUser;
      user?: AuthUser;
    }>(
      `${this.api}/users/me`,
      data
    )

    .pipe(

      tap(
        response => {

          const updatedUser =
            response.data ??
            response.user;


          if (updatedUser) {

            this.setUser(
              updatedUser
            );

          }

        }
      )

    );

}
changePassword(
  currentPassword: string,
  newPassword: string
): Observable<{
  success: boolean;
  message: string;
}> {

  return this.http.put<{
    success: boolean;
    message: string;
  }>(
    `${this.api}/auth/change-password`,
    {
      currentPassword,
      newPassword
    }
  );

}
}
