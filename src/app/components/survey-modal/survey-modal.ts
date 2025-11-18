import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
declare var bootstrap: any;

@Component({
  selector: 'app-survey-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-modal.html',
  styleUrl: './survey-modal.css',
})
export class SurveyModal {
  @Output() surveyCreated = new EventEmitter<any>();

  surveyForm: FormGroup;
  modal: any;
  startNew: boolean = false;

  constructor(private fb: FormBuilder) {
    this.surveyForm = this.fb.group({
      questions: this.fb.array([]),
    });
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(
      this.fb.group({
        question: ['', Validators.required],
        type: ['text', Validators.required],
        options: [''],
      })
    );
  }

  removeQuestion(i: number) {
    this.questions.removeAt(i);
  }

  open(startNew: boolean = false) {
    this.startNew = startNew;

    if (startNew) {
      // starting new → empty form
      this.surveyForm.setControl('questions', this.fb.array([]));
    } else {
      // adding to existing → keep form but ensure at least 1 blank question field
      if (this.questions.length === 0) {
        this.addQuestion();
      }
    }

    this.modal = new bootstrap.Modal(
      document.getElementById('createSurveyModal')!
    );
    this.modal.show();
  }
  close() {
    this.modal?.hide();
  }

  submit() {
    if (this.surveyForm.invalid) return;

    // Emit both form values + startNew flag
    this.surveyCreated.emit({
      startNew: this.startNew,
      questions: this.surveyForm.value.questions,
    });

    this.close();
  }
}
