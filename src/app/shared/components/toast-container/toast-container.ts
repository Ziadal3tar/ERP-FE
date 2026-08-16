import {
  Component,
  inject
} from '@angular/core';

import {
  ToastService
} from '../../../core/services/toast';

@Component({
  selector: 'app-toast-container',

  templateUrl: './toast-container.html',

  styleUrl: './toast-container.scss'
})
export class ToastContainer {

  protected readonly toastService =
    inject(ToastService);

  protected dismiss(id: number): void {

    this.toastService.dismiss(id);

  }

}
