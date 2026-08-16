import {
  Component,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-page-header',

  templateUrl: './page-header.html',

  styleUrl: './page-header.scss'
})
export class PageHeader {

  readonly title = input.required<string>();

  readonly description = input<string>('');

  readonly actionLabel = input<string>('');

  readonly actionIcon = input<string>('bi-plus-lg');

  readonly actionClick = output<void>();

  onAction(): void {

    this.actionClick.emit();

  }

}
