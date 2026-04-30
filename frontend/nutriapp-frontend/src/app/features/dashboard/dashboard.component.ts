import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet, RouterLink, RouterLinkActive,
        MatSidenavModule, MatToolbarModule, MatListModule,
        MatIconModule, MatButtonModule, MatTooltipModule,
    ],
    template: `
    <div class="dashboard-layout">
      <!-- SIDEBAR -->
      <nav class="sidebar glass-sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon-sm">
            <mat-icon>nutrition</mat-icon>
          </div>
          <span class="brand-name">NutriApp</span>
        </div>

        <div class="nav-section">
          <p class="nav-label">MÓDULOS</p>
          <a class="nav-item" routerLink="profile" routerLinkActive="active">
            <mat-icon>person</mat-icon>
            <span>Mi Perfil</span>
            <div class="active-indicator"></div>
          </a>
          <a class="nav-item" routerLink="calculator" routerLinkActive="active">
            <mat-icon>calculate</mat-icon>
            <span>Calculadora</span>
            <div class="active-indicator"></div>
          </a>
          <a class="nav-item" routerLink="diets" routerLinkActive="active">
            <mat-icon>restaurant_menu</mat-icon>
            <span>Dietas</span>
            <div class="active-indicator"></div>
          </a>
        </div>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()" matTooltip="Cerrar sesión">
            <mat-icon>logout</mat-icon>
            <span>Salir</span>
          </button>
        </div>
      </nav>

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <!-- TOP BAR -->
        <header class="top-bar glass-header">
          <div class="top-bar-left">
            <div class="search-box">
              <mat-icon>search</mat-icon>
              <input type="text" placeholder="Buscar..." />
            </div>
          </div>
          <div class="top-bar-right">
            <div class="user-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
          </div>
        </header>

        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
    styles: [`
    :host { display: block; height: 100vh; }

    .dashboard-layout {
      display: flex;
      height: 100vh;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      overflow: hidden;
    }

    /* SIDEBAR */
    .sidebar {
      width: 240px;
      min-width: 240px;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      border-right: 1px solid rgba(255,255,255,0.1);
    }
    .glass-sidebar {
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(20px);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      padding: 0 0.5rem;
    }
    .brand-icon-sm {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .brand-icon-sm mat-icon { color: white; font-size: 22px; width: 22px; height: 22px; }
    .brand-name { color: white; font-weight: 700; font-size: 1.2rem; }

    .nav-section { flex: 1; }
    .nav-label {
      color: rgba(255,255,255,0.35);
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 1.5px;
      margin: 0 0.5rem 0.75rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      color: rgba(255,255,255,0.55);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
      position: relative;
      margin-bottom: 0.25rem;
      cursor: pointer;
    }
    .nav-item mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active {
      background: rgba(124,58,237,0.25);
      color: #a78bfa;
      box-shadow: inset 0 0 0 1px rgba(124,58,237,0.3);
    }
    .active-indicator {
      display: none;
      position: absolute;
      right: -1rem;
      width: 3px;
      height: 24px;
      background: linear-gradient(#7c3aed, #06b6d4);
      border-radius: 4px;
    }
    .nav-item.active .active-indicator { display: block; }

    .sidebar-footer { margin-top: auto; }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: 1px solid rgba(255,100,100,0.3);
      border-radius: 12px;
      color: rgba(255,120,120,0.8);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(255,100,100,0.1); color: #fca5a5; }
    .logout-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }

    /* MAIN */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .glass-header {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(12px);
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 0.4rem 1rem;
    }
    .search-box mat-icon { color: rgba(255,255,255,0.4); font-size: 18px; }
    .search-box input {
      background: none;
      border: none;
      outline: none;
      color: white;
      font-size: 0.875rem;
      width: 200px;
    }
    .search-box input::placeholder { color: rgba(255,255,255,0.35); }
    .user-avatar mat-icon { color: rgba(255,255,255,0.7); font-size: 32px; width: 32px; height: 32px; cursor: pointer; }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
  `],
})
export class DashboardComponent {
    constructor(private auth: AuthService) { }
    logout(): void { this.auth.logout(); }
}
