import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-results-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-results-table.component.html',
  styleUrls: ['./team-results-table.component.css']
})
export class TeamResultsTableComponent {
  @Input() visibleTeamMatrixRows: any[] = [];
  @Input() uniqueSurveys: any[] = [];
  @Output() deleteResponse = new EventEmitter<{ responseId: string; roleId: number; name: string; userId: string }>();

  onDeleteResponse(responseId: string, roleId: number, name: string, userId: string) {
    this.deleteResponse.emit({ responseId, roleId, name, userId });
  }
}