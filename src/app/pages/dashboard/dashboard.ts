import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SurveyService } from '../../services/survey-service';
import { showSuccess, showError } from '../../shared/utils/alert';
import { Modal } from '../../components/modal/modal';
import { SurveyModal } from '../../components/survey-modal/survey-modal';
import { TeamResults } from '../../components/team-results/team-results';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Modal, SurveyModal, TeamResults],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  @ViewChild(Modal, { static: false }) surveyModal!: Modal;
  @ViewChild(SurveyModal) createSurvey!: SurveyModal;
  @ViewChild(TeamResults) teamResultsModal!: TeamResults;

  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  surveys: any[] = [];
  selectedSurveyQuestions: any[] = [];
  isLoading = true;
  teamSurveyData: any[] = [];
  showTeamResults = false;
  hasSubmittedSurvey = false;
  submittedSurveyId: string | null = null;
  submittedSurveyIds: string[] = []; // list of survey IDs the user has submitted

  constructor(private surveyService: SurveyService, private router: Router) {}

  ngOnInit() {
    this.loadSurveys();
    this.checkSurveyStatus();
    this.loadMyResponses();

    if (['CEO', 'CTO', 'TeamLead'].includes(this.user.role)) {
      this.loadTeamSurveyTable();
    }
  }

  // ------------ Logout ------------
  logout() {
    // clear auth and redirect to login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('active_survey_id');
    this.router.navigate(['/auth/login']);
  }

  // ------------ Load all surveys submitted by logged-in user ------------
  loadMyResponses() {
    this.surveyService.getMyResponses().subscribe({
      next: (res: any) => {
        if (Array.isArray(res.data)) {
          this.submittedSurveyIds = res.data.map((id: any) => String(id));
        } else {
          this.submittedSurveyIds = [];
        }
      },
      error: () => {
        this.submittedSurveyIds = [];
      },
    });
  }

  // ------------ Load Survey Questions ------------
  loadSurveys() {
    this.surveyService.getQuestions().subscribe({
      next: (res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          // assign full survey list to UI
          this.surveys = res.data;

          // find active survey & store ID
          const activeSurvey = res.data.find(
            (item: any) => item.survey.isActive === true
          );

          if (activeSurvey) {
            localStorage.setItem('active_survey_id', activeSurvey.survey._id);
          } else {
            localStorage.removeItem('active_survey_id');
          }
        } else {
          this.surveys = [];
          localStorage.removeItem('active_survey_id');
        }

        this.isLoading = false;
        this.checkSurveyStatus();
      },
      error: () => (this.isLoading = false),
    });
  }

  // ------------ Check if logged user has submitted survey ------------
  checkSurveyStatus() {
    this.surveyService.getMySurveyStatus().subscribe({
      next: (res: any) => {
        this.hasSubmittedSurvey = res.data?.submitted || false;

        // Only treat a survey as "submitted by this user" when the backend
        // explicitly says the user has submitted (res.data.submitted === true).
        // The my-survey-status endpoint returns the active survey id even when
        // the user hasn't submitted it, so we must not treat that as "completed".
        this.submittedSurveyId = res.data?.submitted ? res.data?.surveyId || null : null;

        if (res.data?.surveyId) {
          localStorage.setItem('active_survey_id', res.data.surveyId);
          console.log('🟢 Saved Active Survey ID:', res.data.surveyId);
        } else {
          localStorage.removeItem('active_survey_id');
        }
      },
      error: () => {},
    });
  }

  // ------------ Open Survey Fill Modal ------------
  openSurveyModal(survey: any): void {
    // Prevent opening the modal if the user already submitted this specific survey
    if (this.submittedSurveyIds.includes(survey.survey._id)) {
      showError('You have already filled this survey!');
      return;
    }

    this.selectedSurveyQuestions = survey.questions;
    this.surveyModal.open();
}

  // ------------ Submit Survey Answers ------------
  handleSurveySubmit(formData: any) {
    const surveyId = localStorage.getItem('active_survey_id');

    if (!surveyId) {
      showError('No active survey found');
      return;
    }

    const payload = {
      surveyId,
      answers: formData.answers, // modal se aaye answers
    };

    console.log('📤 Submitting payload:', payload);

    this.surveyService.submitSurvey(payload).subscribe({
      next: () => {
        showSuccess('Survey submitted successfully!');
        this.hasSubmittedSurvey = true;
        this.submittedSurveyId = surveyId; // mark the currently-active survey as submitted for this user
        // keep the persisted list in sync so reloads still show Completed
        if (surveyId && !this.submittedSurveyIds.includes(surveyId)) {
          this.submittedSurveyIds.push(surveyId);
        }
        this.loadSurveys();
      },
      error: (err) =>
        showError(err.error?.message || 'Error submitting survey'),
    });
  }

  // ------------ Open Create Survey Modal ------------
  openCreateSurveyModal() {
    this.createSurvey.open(true);
  }

  // ------------ Create Survey ------------
  handleCreateSurvey(data: any) {
    const { questions } = data;

    if (!questions || questions.length === 0) {
      showError('Please add at least one question.');
      return;
    }

    const payload = {
      questions: questions.map((q: any) => ({
        question: q.question,
        type: q.type,
        options: q.options
          ? q.options.split(',').map((o: string) => o.trim())
          : [],
      })),
    };

    this.surveyService.createSurvey(payload).subscribe({
      next: () => {
        showSuccess('✔ Survey created successfully');
        this.loadSurveys();
      },
      error: (err) =>
        showError(err.error?.message || '❌ Error creating survey'),
    });
  }

  // ------------ Fetch subordinate survey records ------------
  loadTeamSurveyTable() {
    this.surveyService.getTeamResponses().subscribe({
      next: (res) => (this.teamSurveyData = res.data || []),
      error: () => {},
    });
  }

  // ------------ Open Team Results Section ------------
  viewTeamResponses() {
    this.surveyService.getTeamResponses().subscribe({
      next: (res) => {
        this.teamSurveyData = res.data || [];
        this.showTeamResults = true;
      },
      error: (err) => showError(err.error?.message || 'Error fetching results'),
    });
  }

  closeTeamResults() {
    this.showTeamResults = false;
  }

  // ------------ View Selected User Result ------------
  openUserSurveyResult(row: any) {
    this.selectedSurveyQuestions = row.answers.map((ans: any) => ({
      question: ans.questionId.question,
      answer: ans.answer,
    }));

    this.showTeamResults = true;
  }
}
