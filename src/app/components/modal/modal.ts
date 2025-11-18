import { ChangeDetectorRef, Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
declare var bootstrap: any;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal implements OnChanges {
  @Input() questions: any[] = [];
  @Output() submitted = new EventEmitter<any>();

  surveyForm!: FormGroup;
  modal: any;

  constructor(private fb: FormBuilder) {}

  // Build form only when questions input changes
  ngOnChanges(changes: SimpleChanges) {
    if (changes['questions'] && this.questions?.length > 0) {
      const controls: any = {};
      this.questions.forEach((q) => {
        controls[q._id] = ['', Validators.required];
      });
      this.surveyForm = this.fb.group(controls);
      // console.log("Controls:", Object.keys(this.surveyForm.controls));
    }
  }

  open() {
    if (!this.surveyForm) return; // avoid errors
    this.modal = new bootstrap.Modal(document.getElementById('globalSurveyModal')!);
    this.modal.show();
  }

  close() {
    this.modal?.hide();
  }

  onSubmit() {
    const answers = Object.keys(this.surveyForm.value).map((key) => ({
      questionId: key,
      answer: this.surveyForm.value[key],
    }));

    console.log("📌 Final Payload:", answers);
    this.submitted.emit({ answers });
    this.close();
  }
}
