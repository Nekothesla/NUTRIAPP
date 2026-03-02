import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

interface TokenResponse {
    access_token: string;
    token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'nutriapp_token';
    private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

    isAuthenticated = computed(() => !!this._token());

    constructor(private api: ApiService, private router: Router) { }

    login(username: string, password: string): Observable<TokenResponse> {
        return this.api.post<TokenResponse>('/auth/login', { username, password }).pipe(
            tap(res => {
                this._token.set(res.access_token);
                localStorage.setItem(this.TOKEN_KEY, res.access_token);
            })
        );
    }

    register(username: string, email: string, password: string): Observable<unknown> {
        return this.api.post('/auth/register', { username, email, password });
    }

    logout(): void {
        this._token.set(null);
        localStorage.removeItem(this.TOKEN_KEY);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return this._token();
    }
}
