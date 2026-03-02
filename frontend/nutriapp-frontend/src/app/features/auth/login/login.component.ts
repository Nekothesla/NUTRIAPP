import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule,
        MatTabsModule, MatIconModule,
    ],
    template: `
    <div class="login-page">
      <!-- Animated background blobs -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <div class="login-container">
        <!-- Logo / Brand -->
        <div class="brand">
          <div class="brand-icon">
            <mat-icon>nutrition</mat-icon>
          </div>
          <h1>NutriApp</h1>
          <p>Tu compañero inteligente de nutrición</p>
        </div>

        <mat-card class="glass-card">
          <mat-tab-group [(selectedIndex)]="selectedTab" animationDuration="200ms">
            <!-- LOGIN TAB -->
            <mat-tab label="Iniciar Sesión">
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Usuario</mat-label>
                  <mat-icon matPrefix>person</mat-icon>
                  <input matInput formControlName="username" placeholder="Tu nombre de usuario" />
                  <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                    El usuario es requerido
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contraseña</mat-label>
                  <mat-icon matPrefix>lock</mat-icon>
                  <input matInput [type]="showPass() ? 'text' : 'password'" formControlName="password" />
                  <button mat-icon-button matSuffix type="button" (click)="showPass.set(!showPass())">
                    <mat-icon>{{ showPass() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                    La contraseña es requerida
                  </mat-error>
                </mat-form-field>

                <button mat-raised-button class="submit-btn" type="submit"
                  [disabled]="loginForm.invalid || loading()">
                  <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
                  <span *ngIf="!loading()">Iniciar Sesión</span>
                </button>
              </form>
            </mat-tab>

            <!-- REGISTER TAB -->
            <mat-tab label="Registrarse">
              <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Usuario</mat-label>
                  <mat-icon matPrefix>person</mat-icon>
                  <input matInput formControlName="username" placeholder="Elige un usuario" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <mat-icon matPrefix>email</mat-icon>
                  <input matInput formControlName="email" type="email" placeholder="tu@email.com" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contraseña</mat-label>
                  <mat-icon matPrefix>lock</mat-icon>
                  <input matInput [type]="showPass() ? 'text' : 'password'" formControlName="password" />
                  <button mat-icon-button matSuffix type="button" (click)="showPass.set(!showPass())">
                    <mat-icon>{{ showPass() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>

                <button mat-raised-button class="submit-btn" type="submit"
                  [disabled]="registerForm.invalid || loading()">
                  <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
                  <span *ngIf="!loading()">Crear Cuenta</span>
                </button>
              </form>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
      animation: float 8s ease-in-out infinite alternate;
    }
    .blob-1 { width: 400px; height: 400px; background: radial-gradient(circle, #7c3aed, #4f46e5); top: -100px; left: -100px; }
    .blob-2 { width: 300px; height: 300px; background: radial-gradient(circle, #06b6d4, #3b82f6); bottom: -80px; right: -80px; animation-delay: 2s; }
    .blob-3 { width: 250px; height: 250px; background: radial-gradient(circle, #f472b6, #ec4899); top: 40%; left: 60%; animation-delay: 4s; }

    @keyframes float {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(30px, 30px) scale(1.1); }
    }

    .login-container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 440px;
      padding: 1rem;
    }

    .brand {
      text-align: center;
      margin-bottom: 2rem;
      color: white;
    }
    .brand-icon {
      width: 72px; height: 72px;
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
      box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4);
    }
    .brand-icon mat-icon { font-size: 36px; width: 36px; height: 36px; color: white; }
    .brand h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.25rem; letter-spacing: -0.5px; }
    .brand p { font-size: 0.9rem; opacity: 0.7; margin: 0; }

    .glass-card {
      background: rgba(255, 255, 255, 0.07) !important;
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px !important;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4) !important;
      padding: 0.5rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1.5rem 1rem 1rem;
    }

    .full-width { width: 100%; }

    .submit-btn {
      background: linear-gradient(135deg, #7c3aed, #4f46e5) !important;
      color: white !important;
      height: 48px;
      border-radius: 12px !important;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35) !important;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .submit-btn:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(124, 58, 237, 0.5) !important;
    }

    ::ng-deep .mat-mdc-tab-label-container { border-bottom: none !important; }
    ::ng-deep .mdc-tab-indicator { display: none; }
    ::ng-deep .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label { color: #a78bfa !important; }
    ::ng-deep .mat-mdc-tab .mdc-tab__text-label { color: rgba(255,255,255,0.5) !important; }

  `],
})
export class LoginComponent {
    selectedTab = 0;
    showPass = signal(false);
    loading = signal(false);
    loginForm: ReturnType<FormBuilder['group']>;
    registerForm: ReturnType<FormBuilder['group']>;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private snack: MatSnackBar,
    ) {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
        this.registerForm = this.fb.group({
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    onLogin(): void {
        if (this.loginForm.invalid) return;
        this.loading.set(true);
        const { username, password } = this.loginForm.value;
        this.auth.login(username!, password!).subscribe({
            next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
            error: (err) => {
                this.loading.set(false);
                const msg = err.error?.detail ?? 'Error al iniciar sesión';
                this.snack.open(msg, 'Cerrar', { duration: 4000, panelClass: 'error-snack' });
            },
        });
    }

    onRegister(): void {
        if (this.registerForm.invalid) return;
        this.loading.set(true);
        const { username, email, password } = this.registerForm.value;
        this.auth.register(username!, email!, password!).subscribe({
            next: () => {
                this.loading.set(false);
                this.snack.open('¡Cuenta creada! Ahora inicia sesión.', 'OK', { duration: 4000 });
                this.selectedTab = 0;
            },
            error: (err) => {
                this.loading.set(false);
                const msg = err.error?.detail ?? 'Error al registrarse';
                this.snack.open(msg, 'Cerrar', { duration: 4000, panelClass: 'error-snack' });
            },
        });
    }
}
