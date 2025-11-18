import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getQuestions(): Observable<any> {
    return this.http.get(
      `${this.BASE_URL}survey/questions`,
      this.getAuthHeaders()
    );
  }

  submitSurvey(data: any): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}survey/submit`,
      data,
      this.getAuthHeaders()
    );
  }

  getTeamResponses(): Observable<any> {
    return this.http.get(
      `${this.BASE_URL}survey/subordinate-surveys`,
      this.getAuthHeaders()
    );
  }

  createSurvey(data: any): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}survey/create`,
      data,
      this.getAuthHeaders()
    );
  }

  getMySurveyStatus() {
    return this.http.get(
      `${this.BASE_URL}survey/my-survey-status`,
      this.getAuthHeaders()
    );
  }

  getMyResponses() {
    return this.http.get(
      `${this.BASE_URL}survey/my-responses`,
      this.getAuthHeaders()
    );
  }
}
