import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SurveyService } from '../../services/survey-service';
import { showSuccess, showError, showDeleteConfirm } from '../../shared/utils/alert';
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
  selectedSurveyId: string | null = null;
  isLoading = true;
  teamSurveyData: any[] = [];
  showTeamResults = false; // legacy, kept for compatibility but UI now shows team groups by default for leaders
  teamGroups: any[] = []; // grouped by user for display
  uniqueSurveys: Array<{ surveyId: string; version: number | null }> = [];
  teamMatrixRows: any[] = []; // rows for matrix table
  
  hasSubmittedSurvey = false;
  submittedSurveyId: string | null = null;
  submittedSurveyIds: string[] = []; // list of survey IDs the user has submitted

  constructor(private surveyService: SurveyService, private router: Router) {}

  ngOnInit() {
    this.loadSurveys();
    this.checkSurveyStatus();
    this.loadMyResponses();

    // Allow PM to load team responses as well (UI already shows PM in template)
    if (['CEO', 'CTO', 'TeamLead', 'PM'].includes(this.user.role)) {
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
          console.log('🔁 my-responses:', this.submittedSurveyIds);
        } else {
          this.submittedSurveyIds = [];
        }
      },
      error: () => {
        this.submittedSurveyIds = [];
      },
    });
  }

  isSubmitted(surveyId: any): boolean {
    return this.submittedSurveyIds.includes(String(surveyId));
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
    // DEBUG: log ids to help troubleshoot why a survey may be blocked
    console.log('➡ openSurveyModal check:', {
      surveyId: String(survey.survey._id),
      submittedIds: this.submittedSurveyIds,
      isSubmitted: this.isSubmitted(survey.survey._id),
    });

    // Prevent opening the modal if the user already submitted this specific survey
    if (this.isSubmitted(survey.survey._id)) {
      showError('You have already filled this survey!');
      return;
    }

  this.selectedSurveyQuestions = survey.questions;
  // track which survey the user opened so submits go to the correct survey
  this.selectedSurveyId = String(survey.survey._id);
    this.surveyModal.open();
}

  // ------------ Submit Survey Answers ------------
  handleSurveySubmit(formData: any) {
    // prefer the survey the user opened; fall back to active_survey_id if present
    const surveyId = this.selectedSurveyId || localStorage.getItem('active_survey_id');

    if (!surveyId) {
      showError('No survey selected');
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
        const sid = String(surveyId);
        if (surveyId && !this.submittedSurveyIds.includes(sid)) {
          this.submittedSurveyIds.push(sid);
        }
        // reset selected survey after successful submit
        this.selectedSurveyId = null;
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
      next: (res) => {
        this.teamSurveyData = res.data || [];
        this.sortTeamSurveyData();
        this.buildTeamGroups();
      },
      error: () => {},
    });
  }

  // ------------ Open Team Results Section ------------
  viewTeamResponses() {
    this.surveyService.getTeamResponses().subscribe({
      next: (res) => {
        this.teamSurveyData = res.data || [];
        this.sortTeamSurveyData();
        this.buildTeamGroups();
        this.showTeamResults = true;
      },
      error: (err) => showError(err.error?.message || 'Error fetching results'),
    });
  }

  // Build grouped structure: [{ userId, userName, role, entries: [{ surveyId, version, submitted, answers }] }]
  buildTeamGroups() {
    const map: Record<string, any> = {};
    (this.teamSurveyData || []).forEach((r: any) => {
      const uid = String(r.userId?._id || r.userId);
      if (!map[uid]) {
        map[uid] = {
          userId: r.userId,
          name: `${r.userId?.first_name || ''} ${r.userId?.last_name || ''}`.trim(),
          role: r.userId?.roleId?.name || '',
          entries: [],
        };
      }

      map[uid].entries.push({
        responseId: r._id,
        surveyId: r.surveyId?._id || r.surveyId,
        version: r.surveyId?.version || r.surveyVersion || null,
        submitted: r.answers && r.answers.length > 0,
        answers: r.answers || [],
        createdAt: r.createdAt,
      });
    });

    // convert to array and sort users by role level desc (use roleId.level if available)
    this.teamGroups = Object.values(map).map((g: any) => {
      // sort entries by version desc (latest first)
      g.entries.sort((a: any, b: any) => (b.version || 0) - (a.version || 0));
      return g;
    });

    // optionally sort users by role level (higher level first)
    // sort users by explicit role priority to avoid relying on numeric levels
    const rolePriority: Record<string, number> = {
      ceo: 6,
      cto: 5,
      pm: 4,
      teamlead: 3,
      developer: 2,
      intern: 1,
      internee: 1,
    };

    this.teamGroups.sort((a: any, b: any) => {
      const aRole = String(a.userId?.roleId?.name || a.role || '').toLowerCase().trim();
      const bRole = String(b.userId?.roleId?.name || b.role || '').toLowerCase().trim();
      const aPriority = rolePriority[aRole] ?? 0;
      const bPriority = rolePriority[bRole] ?? 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return (a.name || '').localeCompare(b.name || '');
    });

    // Build unique survey list and matrix rows for table-with-columns view
    const surveyMap: Record<string, number> = {};
    (this.teamSurveyData || []).forEach((r: any) => {
      const sid = String(r.surveyId?._id || r.surveyId);
      const ver = r.surveyId?.version || r.surveyVersion || null;
      if (!surveyMap[sid]) surveyMap[sid] = ver ?? 0;
    });

    // create sorted uniqueSurveys by version asc
    this.uniqueSurveys = Object.keys(surveyMap)
      .map((k) => ({ surveyId: k, version: surveyMap[k] }))
      .sort((a, b) => (a.version || 0) - (b.version || 0));

    // build rows: one row per user with cells for each surveyId
    this.teamMatrixRows = this.teamGroups.map((g: any) => {
      const cells: Record<string, any> = {};
      g.entries.forEach((e: any) => {
        const sid = String(e.surveyId);
        // build a short answers summary
        const summaryLines = (e.answers || []).map((a: any) => {
          const q = a.questionId?.question || a.question || '';
          const ans = Array.isArray(a.answer) ? a.answer.join(', ') : (a.answer ?? '');
          return { question: q, answer: ans };
        });
        const summary = summaryLines
          .map((l: any) => (l.question ? `${l.question}: ${l.answer}` : `${l.answer}`))
          .join(' | ');
        cells[sid] = { ...e, summaryLines, summary };
      });
      return { userId: g.userId, name: g.name, role: g.role, cells };
    });
  }

  // ------------ Permission helper: can current user delete a given target role level?
  // Helper: compute a comparable priority value where larger = more senior
  // Uses role name mapping first; if numeric level is present in DB and name missing,
  // converts it so that lower DB level (e.g. 2) becomes higher priority than higher DB level (e.g. 6).
  private getEffectivePriority(roleName?: string, roleLevel?: number): number {
    const rolePriority: Record<string, number> = {
      ceo: 6,
      cto: 5,
      pm: 4,
      teamlead: 3,
      developer: 2,
      intern: 1,
      internee: 1,
    };

    if (roleName) {
      const p = rolePriority[String(roleName).toLowerCase()];
      if (typeof p === 'number') return p;
    }

    // If numeric DB level is present, convert it into the same 1..6 scale used above.
    // Your DB stores smaller numbers for more senior roles (e.g. CTO=2, Intern=6).
    // We invert that using the known max level (6) so that smaller DB level -> larger effective priority.
    if (typeof roleLevel === 'number' && !isNaN(roleLevel) && roleLevel > 0) {
      const maxLevel = 6; // matches your DB role levels (Intern=6)
      // clamp and invert into 1..maxLevel
      const clamped = Math.max(1, Math.min(roleLevel, maxLevel));
      return maxLevel - clamped + 1;
    }

    return 0;
  }

  // ------------ Permission helper: can current user delete a given target role level?
  canDeleteTarget(targetRoleLevel: number | null | undefined, targetRoleName?: string, targetUserId?: string): boolean {
    // Prevent deleting your own responses
    if (targetUserId && String(targetUserId) === String(this.user?._id || this.user?.id || '')) return false;

    const myRoleName = String(this.user?.role || '').toLowerCase();
    const myLevelFromData = Number(this.user?.roleLevel ?? 0);
    const myPriority = this.getEffectivePriority(myRoleName, myLevelFromData);

    const targetPriority = this.getEffectivePriority(targetRoleName, Number(targetRoleLevel ?? 0));

    return myPriority > targetPriority;
  }

  // ------------ Delete a response (with confirmation) ------------
  confirmAndDelete(responseId: string, targetRoleLevel?: number, targetName?: string, targetUserId?: string) {
    if (!responseId) return;
    // detailed denial messages
    const myId = String(this.user?._id || this.user?.id || '');
    if (targetUserId && String(targetUserId) === myId) {
      showError('You cannot delete your own responses');
      return;
    }

    if (!this.canDeleteTarget(targetRoleLevel, targetName, targetUserId)) {
      showError('You can only delete responses of subordinate users');
      return;
    }

    // Use SweetAlert confirm flow and on confirm just print the surveyId (for now)
    // Confirm with SweetAlert and perform actual delete via backend
    showDeleteConfirm('this response').then((confirmed) => {
      if (!confirmed) return;

      this.surveyService.deleteResponse(responseId).subscribe({
        next: () => {
          showSuccess('Response deleted');
          this.loadTeamSurveyTable();
        },
        error: (err) => showError(err.error?.message || 'Error deleting response'),
      });
    });
  }

  // Simple UI helper: whether to show delete button for a given row/cell.
  // We keep backend as the source of truth; this only hides the button for disallowed roles and self-deletes.
  canShowDeleteButton(row: any): boolean {
    const targetId = row?.userId?._id || row?.userId;
    const myId = String(this.user?._id || this.user?.id || '');
    if (String(targetId) === myId) return false; // no self-delete

    // hide if target has no responses
    const hasResponses = Object.keys(row?.cells || {}).length > 0;
    if (!hasResponses) return false;

    const myRoleName = String(this.user?.role || '').toLowerCase();
    const myLevelFromData = Number(this.user?.roleLevel ?? 0);
    const myPriority = this.getEffectivePriority(myRoleName, myLevelFromData);

    const targetRoleName = String(row?.userId?.roleId?.name || row?.role || '').toLowerCase();
    const targetLevel = Number(row?.userId?.roleId?.level ?? 0);
    const targetPriority = this.getEffectivePriority(targetRoleName, targetLevel);

    return myPriority > targetPriority;
  }

  // Return null when allowed, else a human-readable reason why delete not allowed
  canDeleteReason(row: any): string | null {
    const targetId = row?.userId?._id || row?.userId;
    const myId = String(this.user?._id || this.user?.id || '');
    if (String(targetId) === myId) return 'You cannot delete your own responses';

    const hasResponses = Object.keys(row?.cells || {}).length > 0;
    if (!hasResponses) return 'No responses available';

    const myRoleName = String(this.user?.role || '').toLowerCase();
    const myLevelFromData = Number(this.user?.roleLevel ?? 0);
    const myPriority = this.getEffectivePriority(myRoleName, myLevelFromData);

    const targetRoleName = String(row?.userId?.roleId?.name || row?.role || '').toLowerCase();
    const targetLevel = Number(row?.userId?.roleId?.level ?? 0);
    const targetPriority = this.getEffectivePriority(targetRoleName, targetLevel);

    if (myPriority <= targetPriority) return 'You can only delete responses of subordinate users';

    return null;
  }

  
  

  // Sort teamSurveyData by role level (desc) then by submission status (submitted first)
  sortTeamSurveyData() {
    if (!Array.isArray(this.teamSurveyData)) return;
    // determine current user's role level (try to find in team data first)
    const myId = String(this.user?._id || this.user?.id || '');
    const myEntry = this.teamSurveyData.find((r: any) => String(r.userId?._id) === myId || String(r.userId?._id) === String(this.user?._id));
    const myLevel = Number(myEntry?.userId?.roleId?.level ?? this.user?.roleLevel ?? 0);

    // compute average level to decide sorting direction when needed
    const levels = this.teamSurveyData.map((r: any) => Number(r.userId?.roleId?.level ?? 0)).filter((l: number) => l > 0);
    const avgLevel = levels.length ? levels.reduce((s: number, v: number) => s + v, 0) / levels.length : 0;

    // If current user's level is >= average, show higher roles first; otherwise show lower roles first
    const higherFirst = myLevel >= avgLevel;

    this.teamSurveyData.sort((a: any, b: any) => {
      const aLevel = Number(a.userId?.roleId?.level ?? 0);
      const bLevel = Number(b.userId?.roleId?.level ?? 0);

      // primary: role level (direction depends on viewer)
      if (aLevel !== bLevel) return higherFirst ? (bLevel - aLevel) : (aLevel - bLevel);

      // secondary: submitted first (those with answers first)
      const aSubmitted = (a.answers && a.answers.length > 0) ? 1 : 0;
      const bSubmitted = (b.answers && b.answers.length > 0) ? 1 : 0;
      if (aSubmitted !== bSubmitted) return bSubmitted - aSubmitted;

      // tertiary: alphabetical by last name
      const aName = (a.userId?.last_name || '').toLowerCase();
      const bName = (b.userId?.last_name || '').toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
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
