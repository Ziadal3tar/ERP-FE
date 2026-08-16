import {
  Component,
  computed,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-pagination',

  templateUrl: './pagination.html',

  styleUrl: './pagination.scss'
})
export class Pagination {

  readonly page =
    input.required<number>();

  readonly totalPages =
    input.required<number>();

  readonly total =
    input<number>(0);

  readonly pageChange =
    output<number>();

  protected readonly pages =
    computed(() => {

      const current =
        this.page();

      const total =
        this.totalPages();

      if (total <= 5) {

        return Array.from(
          { length: total },
          (_, index) => index + 1
        );

      }

      if (current <= 3) {

        return [1, 2, 3, 4, 5];

      }

      if (current >= total - 2) {

        return [
          total - 4,
          total - 3,
          total - 2,
          total - 1,
          total
        ];

      }

      return [
        current - 2,
        current - 1,
        current,
        current + 1,
        current + 2
      ];

    });

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages() ||
      page === this.page()
    ) {

      return;

    }

    this.pageChange.emit(page);

  }

  previous(): void {

    this.goToPage(
      this.page() - 1
    );

  }

  next(): void {

    this.goToPage(
      this.page() + 1
    );

  }

}
