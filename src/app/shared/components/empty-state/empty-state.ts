import {
  Component,
  input
} from '@angular/core';

@Component({
  selector: 'app-empty-state',

  templateUrl: './empty-state.html',

  styleUrl: './empty-state.scss'
})
export class EmptyState {

  readonly icon =
    input<string>('bi-inbox');

  readonly title =
    input<string>('No data found');

  readonly message =
    input<string>('');

}
