import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private BASE_URL = environment.apiUrl;

    constructor(private http: HttpClient) { }

    setToken(token: string) {
        localStorage.setItem('auth_token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    clearToken() {
        localStorage.removeItem('auth_token');
    }

    private authHeaders() {
        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${this.getToken()}`,
            }),
        };
    }

    // ================= AUTH API CALLS =================

    signup(data: any): Observable<any> {
        return this.http.post(`${this.BASE_URL}signup`, data);
    }

    login(data: any): Observable<any> {
        return this.http.post(`${this.BASE_URL}login`, data);
    }

    getProfile(): Observable<any> {
        return this.http.get(`${this.BASE_URL}/auth/me`, this.authHeaders());
    }

    updateProfile(data: any): Observable<any> {
        return this.http.patch(
            `${this.BASE_URL}/auth/update-profile`,
            data,
            this.authHeaders()
        );
    }

    logout() {
        this.clearToken();
    }

    // ================= GENERIC CRUD HELPERS =================

    get(endpoint: string): Observable<any> {
        return this.http.get(`${this.BASE_URL}/${endpoint}`, this.authHeaders());
    }

    post(endpoint: string, payload: any): Observable<any> {
        return this.http.post(
            `${this.BASE_URL}/${endpoint}`,
            payload,
            this.authHeaders()
        );
    }

    patch(endpoint: string, payload: any): Observable<any> {
        return this.http.patch(
            `${this.BASE_URL}/${endpoint}`,
            payload,
            this.authHeaders()
        );
    }

    delete(endpoint: string): Observable<any> {
        return this.http.delete(`${this.BASE_URL}/${endpoint}`, this.authHeaders());
    }
}
