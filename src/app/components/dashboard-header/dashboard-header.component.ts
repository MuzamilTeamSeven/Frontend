import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-dashboard-header',
  imports: [CommonModule],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css'],
})
export class DashboardHeaderComponent {
  @Input() user: { first_name: string; last_name: string; role: string } = {
    first_name: '',
    last_name: '',
    role: '',
  };
  @Output() logout = new EventEmitter<void>();

  menuOpen: boolean = false;
  showMenu = false;

  onLogout() {
    this.logout.emit();
  }

  toggleDropdown() {
    this.showMenu = !this.showMenu;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const inside = (event.target as HTMLElement).closest('.avatar-wrapper');
    if (!inside) this.showMenu = false;
  }
}
