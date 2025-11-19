import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-survey-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-card.component.html',
  styleUrls: ['./survey-card.component.css']
})
export class SurveyCardComponent {
  @Input() survey: any;
  @Input() isSubmitted: boolean = false;
  @Output() fillSurvey = new EventEmitter<void>();

  @Input() userRole: string = '';
  @Output() createSurvey = new EventEmitter<void>();

  onCreateSurvey() {
    this.createSurvey.emit();
  }

  onFillSurvey() {
    this.fillSurvey.emit();
  }
}