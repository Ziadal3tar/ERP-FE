import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';

import {
  provideRouter,
  withHashLocation
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  routes
} from './app.routes';

import {
  authInterceptor
} from './core/interceptors/auth.interceptor';

import {
  errorInterceptor
} from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {

  providers: [

    provideBrowserGlobalErrorListeners(),

    provideZonelessChangeDetection(),

    provideRouter(routes, withHashLocation()),

    provideHttpClient(

      withInterceptors([

        authInterceptor,

        errorInterceptor

      ])

    )

  ]

};
