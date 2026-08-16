import {
  Component,
  input,
  output
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  ADMIN_NAVIGATION,
  NavItem
} from './../../core/constants/navigation';

@Component({
  selector: 'app-sidebar',

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './sidebar.html',

  styleUrl: './sidebar.scss'
})
export class Sidebar {

  readonly collapsed =
    input(false);

  readonly mobileOpen =
    input(false);

  readonly closeMobile =
    output<void>();

  protected readonly navigation =
    ADMIN_NAVIGATION;

  protected expandedGroups =
    new Set<string>();

  toggleGroup(label: string): void {

    if (this.collapsed()) {
      return;
    }

    if (this.expandedGroups.has(label)) {

      this.expandedGroups.delete(label);

    } else {

      this.expandedGroups.add(label);

    }

  }

  isGroupExpanded(label: string): boolean {

    return this.expandedGroups.has(label);

  }

  closeMobileMenu(): void {

    this.closeMobile.emit();

  }

  hasChildren(item: NavItem): boolean {

    return !!item.children?.length;

  }

}
