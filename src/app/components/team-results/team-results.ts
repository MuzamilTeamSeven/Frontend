import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-team-results',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf],
  templateUrl: './team-results.html',
  styleUrl: './team-results.css',
})
export class TeamResults {
  @Input() results: any[] = [];
  // Emit when the results panel/modal is closed. Name the output `close` so
  // callers can use `(close)="..."` like in `dashboard.html`.
  @Output() close = new EventEmitter<void>();

  modal: any;

  open() {
    this.modal = new bootstrap.Modal(
      document.getElementById('teamResultsModal')!
    );
    this.modal.show();
  }

  closeModal() {
    this.modal?.hide();
    this.close.emit();
  }

  // helper so template can check arrays without referencing global Array
  isArray(val: any): boolean {
    return Array.isArray(val);
  }
}
