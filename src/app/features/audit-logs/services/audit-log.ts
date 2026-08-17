import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  map,
  Observable
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  AuditAction,
  AuditLog,
  AuditLogApiResponse,
  AuditLogListResponse,
  AuditModule
} from '../models/audit-log.model';


@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  private readonly http =
    inject(HttpClient);


  private readonly api =
    `${environment.apiUrl}/audit-logs`;




  getAuditLogs(
    page = 1,
    limit = 20,
    user = '',
    module: AuditModule | '' = '',
    action: AuditAction | '' = ''
  ): Observable<AuditLogListResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('limit', limit);


    if (user) {

      params =
        params.set(
          'user',
          user
        );

    }


    if (module) {

      params =
        params.set(
          'module',
          module
        );

    }


    if (action) {

      params =
        params.set(
          'action',
          action
        );

    }


    return this.http

      .get<AuditLogListResponse>(
        this.api,
        {
          params
        }
      );

  }




  getAuditLogById(
    id: string
  ): Observable<AuditLog> {

    return this.http

      .get<
        AuditLogApiResponse<AuditLog>
      >(
        `${this.api}/${id}`
      )

      .pipe(

        map(
          response =>
            response.data
        )

      );

  }

}
