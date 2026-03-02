import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Chart, registerables } from 'chart.js';
import { ProfileService, UserProfile } from '../../core/services/profile.service';

Chart.register(...registerables);

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDividerModule,
  ],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>person</mat-icon>
          Mi Perfil
        </h1>
        <p class="page-subtitle">Registra tu composición corporal para un seguimiento preciso.</p>
      </div>

      <div class="profile-grid">
        <!-- FORM CARD -->
        <mat-card class="glass-card form-card">
          <mat-card-header>
            <mat-card-title class="card-title">Datos Corporales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="onSave()" class="profile-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Peso (kg)</mat-label>
                  <mat-icon matPrefix>monitor_weight</mat-icon>
                  <input matInput type="number" formControlName="peso" placeholder="70.5" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Talla (cm)</mat-label>
                  <mat-icon matPrefix>height</mat-icon>
                  <input matInput type="number" formControlName="talla" placeholder="175" />
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Edad (años)</mat-label>
                  <mat-icon matPrefix>cake</mat-icon>
                  <input matInput type="number" formControlName="edad" placeholder="25" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Sexo</mat-label>
                  <mat-icon matPrefix>wc</mat-icon>
                  <mat-select formControlName="sexo">
                    <mat-option value="masculino">Masculino</mat-option>
                    <mat-option value="femenino">Femenino</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>% Masa Grasa</mat-label>
                  <mat-icon matPrefix>water_drop</mat-icon>
                  <input matInput type="number" formControlName="masa_grasa" placeholder="20" />
                  <span matSuffix>%</span>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>% Masa Muscular</mat-label>
                  <mat-icon matPrefix>fitness_center</mat-icon>
                  <input matInput type="number" formControlName="masa_muscular" placeholder="45" />
                  <span matSuffix>%</span>
                </mat-form-field>
              </div>

              <div class="form-row single">
                <mat-form-field appearance="outline">
                  <mat-label>Grasa Visceral (nivel)</mat-label>
                  <mat-icon matPrefix>analytics</mat-icon>
                  <input matInput type="number" formControlName="grasa_visceral" placeholder="5" />
                </mat-form-field>
              </div>

              <button mat-raised-button class="save-btn" type="submit" [disabled]="loading()">
                <mat-spinner *ngIf="loading()" diameter="18"></mat-spinner>
                <mat-icon *ngIf="!loading()">save</mat-icon>
                <span>{{ loading() ? 'Guardando...' : 'Guardar Perfil' }}</span>
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- CHARTS -->
        <div class="charts-col">
          <!-- STAT CARDS -->
          <div class="stat-cards">
            <div class="stat-card" *ngFor="let s of stats()">
              <div class="stat-icon" [style.background]="s.gradient">
                <mat-icon>{{ s.icon }}</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ s.value }}</span>
                <span class="stat-label">{{ s.label }}</span>
              </div>
            </div>
          </div>

          <!-- BODY COMPOSITION PIE -->
          <mat-card class="glass-card chart-card">
            <mat-card-header>
              <mat-card-title class="card-title">Composición Corporal</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-content">
              <canvas #bodyChart></canvas>
              <p *ngIf="!hasChartData()" class="no-data">
                <mat-icon>info</mat-icon>
                Guarda tu perfil para ver la gráfica
              </p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { color: white; }

    .page-header { margin-bottom: 1.5rem; }
    .page-title {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 1.75rem; font-weight: 700; margin: 0 0 0.25rem;
    }
    .page-title mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #a78bfa; }
    .page-subtitle { color: rgba(255,255,255,0.55); margin: 0; }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
      align-items: start;
    }

    .glass-card {
      background: rgba(255,255,255,0.07) !important;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.12) !important;
      border-radius: 20px !important;
      box-shadow: 0 16px 48px rgba(0,0,0,0.3) !important;
    }
    .card-title { color: white !important; font-size: 1rem !important; font-weight: 600 !important; }

    .profile-form { display: flex; flex-direction: column; gap: 0.75rem; padding-top: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-row.single { grid-template-columns: 1fr; }



    .save-btn {
      background: linear-gradient(135deg, #7c3aed, #06b6d4) !important;
      color: white !important;
      height: 48px; border-radius: 12px !important;
      font-size: 1rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(124,58,237,0.3) !important;
    }
    .save-btn:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.5) !important; }

    /* STAT CARDS */
    .stat-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .stat-card {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1rem;
      display: flex; align-items: center; gap: 0.75rem;
      backdrop-filter: blur(16px);
    }
    .stat-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon mat-icon { color: white; font-size: 20px; width: 20px; height: 20px; }
    .stat-info { display: flex; flex-direction: column; min-width: 0; }
    .stat-value { font-size: 1.1rem; font-weight: 700; color: white; white-space: nowrap; }
    .stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-top: 2px; }

    .chart-card .mat-mdc-card-content { padding: 0 1rem 1rem !important; }
    .chart-content { position: relative; height: 240px; display: flex; align-items: center; justify-content: center; }
    .chart-content canvas { max-height: 220px; }
    .no-data {
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      color: rgba(255,255,255,0.35); font-size: 0.85rem; text-align: center;
    }
    .no-data mat-icon { font-size: 32px; width: 32px; height: 32px; }
  `],
})
export class ProfileComponent implements OnInit, AfterViewInit {
  @ViewChild('bodyChart') bodyChartRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  loading = signal(false);
  hasChartData = signal(false);
  stats = signal<{ icon: string; label: string; value: string; gradient: string }[]>([]);

  profileForm: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snack: MatSnackBar,
  ) {
    this.profileForm = this.fb.group({
      peso: [null as number | null],
      talla: [null as number | null],
      edad: [null as number | null],
      sexo: [null as string | null],
      masa_grasa: [null as number | null],
      masa_muscular: [null as number | null],
      grasa_visceral: [null as number | null],
    });
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (p) => { this.profileForm.patchValue(p as any); this.updateStats(p); },
      error: () => { },
    });
  }

  ngAfterViewInit(): void {
    this.initChart([0, 0, 0]);
  }

  private initChart(data: number[]): void {
    if (this.chart) this.chart.destroy();
    if (!this.bodyChartRef) return;
    this.chart = new Chart(this.bodyChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Masa Grasa', 'Masa Muscular', 'Otros'],
        datasets: [{
          data,
          backgroundColor: ['#f472b6', '#34d399', '#818cf8'],
          borderColor: 'rgba(255,255,255,0.05)',
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'rgba(255,255,255,0.7)', padding: 12, font: { size: 11 } },
          },
        },
      },
    });
  }

  private updateStats(p: UserProfile): void {
    const otros = p.masa_grasa && p.masa_muscular ? Math.max(0, 100 - p.masa_grasa - p.masa_muscular) : 0;
    const chartData = [p.masa_grasa ?? 0, p.masa_muscular ?? 0, otros];
    this.hasChartData.set((p.masa_grasa ?? 0) + (p.masa_muscular ?? 0) > 0);
    if (this.hasChartData()) this.initChart(chartData);

    this.stats.set([
      { icon: 'monitor_weight', label: 'Peso', value: p.peso ? `${p.peso} kg` : '—', gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)' },
      { icon: 'height', label: 'Talla', value: p.talla ? `${p.talla} cm` : '—', gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
      { icon: 'water_drop', label: 'Grasa', value: p.masa_grasa ? `${p.masa_grasa}%` : '—', gradient: 'linear-gradient(135deg,#f472b6,#ec4899)' },
      { icon: 'fitness_center', label: 'Músculo', value: p.masa_muscular ? `${p.masa_muscular}%` : '—', gradient: 'linear-gradient(135deg,#34d399,#059669)' },
    ]);
  }

  onSave(): void {
    this.loading.set(true);
    const val = this.profileForm.value as UserProfile;
    this.profileService.saveProfile(val).subscribe({
      next: (saved) => {
        this.loading.set(false);
        this.updateStats(saved);
        this.snack.open('✅ Perfil guardado correctamente', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err.error?.detail ?? 'Error al guardar', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
