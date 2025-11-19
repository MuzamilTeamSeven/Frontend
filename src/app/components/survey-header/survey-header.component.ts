import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-survey-header',
  imports:[CommonModule],
  templateUrl: './survey-header.component.html',
  styleUrls: ['./survey-header.component.css']
})
export class SurveyHeaderComponent {
  @Input() userRole: string = '';
  @Output() createSurvey = new EventEmitter<void>();

  onCreateSurvey() {
    this.createSurvey.emit();
  }
}