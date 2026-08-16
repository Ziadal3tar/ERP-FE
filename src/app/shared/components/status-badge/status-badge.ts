import {
  Component,
  computed,
  input
} from '@angular/core';

@Component({
  selector: 'app-status-badge',

  templateUrl: './status-badge.html',

  styleUrl: './status-badge.scss'
})
export class StatusBadge {

  readonly status =
    input.required<string>();

  protected readonly badgeClass =
    computed(() => {

      const value =
        this.status()
          .toLowerCase()
          .replace(/\s/g, '');

      switch (value) {

        case 'active':
        case 'approved':
        case 'paid':
        case 'received':
        case 'confirmed':
          return 'success';

        case 'pending':
        case 'partiallypaid':
        case 'draft':
          return 'warning';

        case 'inactive':
        case 'rejected':
        case 'cancelled':
        case 'unpaid':
          return 'danger';

        default:
          return 'neutral';

      }

    });

}
