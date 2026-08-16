import {
  Injectable,
  signal
} from '@angular/core';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface ToastItem {

  id: number;

  type: ToastType;

  title: string;

  message: string;

  duration: number;

}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private counter = 0;

  readonly toasts =
    signal<ToastItem[]>([]);

  success(
    message: string,
    title = 'Success'
  ): void {

    this.show(
      'success',
      title,
      message
    );

  }

  error(
    message: string,
    title = 'Something went wrong'
  ): void {

    this.show(
      'error',
      title,
      message
    );

  }

  warning(
    message: string,
    title = 'Warning'
  ): void {

    this.show(
      'warning',
      title,
      message
    );

  }

  info(
    message: string,
    title = 'Information'
  ): void {

    this.show(
      'info',
      title,
      message
    );

  }

  dismiss(id: number): void {

    this.toasts.update(
      items =>
        items.filter(
          item => item.id !== id
        )
    );

  }

  private show(
    type: ToastType,
    title: string,
    message: string
  ): void {

    const id =
      ++this.counter;

    const toast: ToastItem = {

      id,

      type,

      title,

      message,

      duration: 3500

    };

    this.toasts.update(
      items => [
        ...items,
        toast
      ]
    );

    window.setTimeout(
      () => this.dismiss(id),
      toast.duration
    );

  }

}
