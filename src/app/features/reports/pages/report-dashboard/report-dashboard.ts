import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  DecimalPipe
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ReportService
} from '../../services/report';

import {
  DashboardSummary
} from '../../models/report.model';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';


@Component({
  selector: 'app-report-dashboard',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    PageHeader
  ],

  templateUrl:
    './report-dashboard.html',

  styleUrl:
    './report-dashboard.scss'
})
export class ReportDashboard
  implements OnInit {

  private readonly reportService =
    inject(ReportService);

  private readonly destroyRef =
    inject(DestroyRef);


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly summary =
    signal<DashboardSummary | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');


  /*
  |--------------------------------------------------------------------------
  | Lifecycle
  |--------------------------------------------------------------------------
  */

  ngOnInit(): void {

    this.loadDashboard();

  }


  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  protected loadDashboard(): void {

    this.loading.set(true);

    this.error.set('');


    this.reportService

      .getDashboardSummary()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: data => {

          this.summary.set(
            data
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Report dashboard error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load reports dashboard.'
          );

          this.loading.set(false);

        }

      });

  }

}
