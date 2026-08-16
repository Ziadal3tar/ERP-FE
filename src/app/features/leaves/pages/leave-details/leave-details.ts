import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  Leave
} from '../../models/leave.model';

import {
  LeaveService
} from '../../services/leave';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  StatusBadge
} from '../../../../shared/components/status-badge/status-badge';

import {
  LoadingState
} from '../../../../shared/components/loading-state/loading-state';

import {
  ConfirmDialog
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

import {
  ToastService
} from '../../../../core/services/toast';

@Component({
  selector: 'app-leave-details',

  imports: [
    DatePipe,
    FormsModule,
    PageHeader,
    StatusBadge,
    LoadingState,
    ConfirmDialog
  ],

  templateUrl:
    './leave-details.html',

  styleUrl:
    './leave-details.scss'
})
export class LeaveDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly leaveService =
    inject(LeaveService);

  private readonly toast =
    inject(ToastService);

  protected readonly leave =
    signal<Leave | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly actionLoading =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly rejectMode =
    signal(false);

  protected readonly rejectReason =
    signal('');

  private leaveId = '';

  ngOnInit(): void {

    this.leaveId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.leaveId) {

      this.back();

      return;

    }

    this.loadLeave();

  }

  private loadLeave(): void {

    this.loading.set(true);

    this.leaveService
      .getLeave(
        this.leaveId
      )
      .subscribe({

        next: leave => {

          this.leave.set(leave);

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Leave details error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load leave request.'
          );

          this.loading.set(false);

        }

      });

  }

protected get employeeName(): string {

  const employee = this.leave()?.employee;

  if (!employee) {
    return '—';
  }

  return employee.user?.name ?? '—';
}

 protected get employeeCode(): string {

  const employee = this.leave()?.employee;

  return employee?.employeeCode ?? '';
}
protected get employeeJobTitle(): string {

  const employee = this.leave()?.employee;

  return employee?.jobTitle ?? '';
}
  protected approve(): void {

    this.actionLoading.set(true);

    this.leaveService
      .approveLeave(
        this.leaveId
      )
      .subscribe({

        next: leave => {

          this.leave.set(leave);

          this.actionLoading.set(false);

          this.toast.success(
            'Leave request approved successfully.'
          );

        },

        error: error => {

          console.error(
            'Approve leave error:',
            error
          );

          this.actionLoading.set(false);

          this.toast.error(
            error?.error?.message ||
            'Unable to approve leave request.'
          );

        }

      });

  }

  protected openReject(): void {

    this.rejectMode.set(true);

    this.rejectReason.set('');

  }

  protected cancelReject(): void {

    this.rejectMode.set(false);

    this.rejectReason.set('');

  }

  protected reject(): void {

    const reason =
      this.rejectReason().trim();

    if (!reason) {

      this.toast.error(
        'Please provide a rejection reason.'
      );

      return;

    }

    this.actionLoading.set(true);

    this.leaveService
      .rejectLeave(
        this.leaveId,
        reason
      )
      .subscribe({

        next: leave => {

          this.leave.set(leave);

          this.rejectMode.set(false);

          this.rejectReason.set('');

          this.actionLoading.set(false);

          this.toast.success(
            'Leave request rejected.'
          );

        },

        error: error => {

          console.error(
            'Reject leave error:',
            error
          );

          this.actionLoading.set(false);

          this.toast.error(
            error?.error?.message ||
            'Unable to reject leave request.'
          );

        }

      });

  }

  protected cancelLeave(): void {

    this.actionLoading.set(true);

    this.leaveService
      .cancelLeave(
        this.leaveId
      )
      .subscribe({

        next: leave => {

          this.leave.set(leave);

          this.actionLoading.set(false);

          this.toast.success(
            'Leave request cancelled.'
          );

        },

        error: error => {

          console.error(
            'Cancel leave error:',
            error
          );

          this.actionLoading.set(false);

          this.toast.error(
            error?.error?.message ||
            'Unable to cancel leave request.'
          );

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/leaves'
    ]);

  }

}
