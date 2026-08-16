import {
  Component,
  signal
} from '@angular/core';
import {
  ToastContainer
} from '../../shared/components/toast-container/toast-container';
import {
  RouterOutlet
} from '@angular/router';

import {
  Sidebar
} from '../sidebar/sidebar';

import {
  Header
} from '../header/header';

@Component({
  selector: 'app-admin-layout',

  imports: [
    RouterOutlet,
    Sidebar,
    Header,
    ToastContainer
  ],

  templateUrl: './admin-layout.html',

  styleUrl: './admin-layout.scss'
})
export class AdminLayout {

  protected readonly sidebarCollapsed =
    signal(false);

  protected readonly mobileSidebarOpen =
    signal(false);

  toggleSidebar(): void {

    this.sidebarCollapsed.update(
      collapsed => !collapsed
    );

  }

  toggleMobileSidebar(): void {

    this.mobileSidebarOpen.update(
      open => !open
    );

  }

  closeMobileSidebar(): void {

    this.mobileSidebarOpen.set(false);

  }

}
