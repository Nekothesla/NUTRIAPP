import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Chart, registerables } from 'chart.js';
import { ProfileService, CalculatorResponse } from '../../core/services/profile.service';

Chart.register(...registerables);

@Component({
    selector: 'app-calculator',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
        MatButtonModule, MatIconModule, MatProgressSpinnerModule,
        MatSnackBarModule, MatButtonToggleModule,
    ],
    template: `
    <div class="calc-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>calculate</mat-icon>
          Calculadora Nutricional
        </h1>
        <p class="page-subtitle">Calcula tu Gasto Energético y distribución de macronutrientes.</p>
      </div>

      <div class="calc-grid">
        <!-- INPUT CARD -->
        <mat-card class="glass-card">
          <mat-card-header>
            <mat-card-title class="card-title">Parámetros</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="calcForm" (ngSubmit)="onCalculate()" class="calc-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Peso (kg)</mat-label>
                  <mat-icon matPrefix>monitor_weight</mat-icon>
                  <input matInput type="number" formControlName="peso" />
                  <mat-error>Requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Talla (cm)</mat-label>
                  <mat-icon matPrefix>height</mat-icon>
                  <input matInput type="number" formControlName="talla" />
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Edad</mat-label>
                  <mat-icon matPrefix>cake</mat-icon>
                  <input matInput type="number" formControlName="edad" />
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

              <!-- MODO -->
              <div class="modo-section">
                <p class="modo-label">Objetivo</p>
                <mat-button-toggle-group formControlName="modo" class="modo-group">
                  <mat-button-toggle value="mantenimiento">
                    <mat-icon>balance</mat-icon>
                    Mantenimiento
                  </mat-button-toggle>
                  <mat-button-toggle value="volumen">
                    <mat-icon>trending_up</mat-icon>
                    Volumen
                  </mat-button-toggle>
                  <mat-button-toggle value="definicion">
                    <mat-icon>straighten</mat-icon>
                    Definición
                  </mat-button-toggle>
                </mat-button-toggle-group>
              </div>

              <!-- MACRO RATIOS PREVIEW -->
              <div class="ratio-preview" *ngIf="modoRatios()">
                <div class="ratio-item" *ngFor="let r of modoRatios()">
                  <div class="ratio-bar" [style.width.%]="r.pct" [style.background]="r.color"></div>
                  <span>{{ r.label }}: {{ r.pct }}%</span>
                </div>
              </div>

              <button mat-raised-button class="calc-btn" type="submit" [disabled]="calcForm.invalid || loading()">
                <mat-spinner *ngIf="loading()" diameter="18"></mat-spinner>
                <mat-icon *ngIf="!loading()">bolt</mat-icon>
                <span>{{ loading() ? 'Calculando...' : 'Calcular' }}</span>
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- RESULTS -->
        <div class="results-col" *ngIf="result()">
          <!-- GEB / GET CARDS -->
          <div class="energy-cards">
            <div class="energy-card" style="background: linear-gradient(135deg, rgba(124,58,237,0.5), rgba(79,70,229,0.3));">
              <div class="energy-icon"><mat-icon>local_fire_department</mat-icon></div>
              <div>
                <div class="energy-value">{{ result()!.geb | number:'1.0-0' }}</div>
                <div class="energy-label">GEB (kcal/día)</div>
                <div class="energy-sub">Gasto Energético Basal</div>
              </div>
            </div>
            <div class="energy-card" style="background: linear-gradient(135deg, rgba(6,182,212,0.5), rgba(59,130,246,0.3));">
              <div class="energy-icon"><mat-icon>directions_run</mat-icon></div>
              <div>
                <div class="energy-value">{{ result()!.get | number:'1.0-0' }}</div>
                <div class="energy-label">GET (kcal/día)</div>
                <div class="energy-sub">Actividad moderada ×1.55</div>
              </div>
            </div>
          </div>

          <!-- MACROS DONUT -->
          <mat-card class="glass-card macros-card">
            <mat-card-header>
              <mat-card-title class="card-title">Distribución de Macros</mat-card-title>
              <mat-card-subtitle class="card-subtitle">
                Modo: <span class="mode-badge">{{ result()!.modo | titlecase }}</span>
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="macros-content">
              <div class="macros-chart-wrap">
                <canvas #macrosChart style="max-height:220px;"></canvas>
              </div>
              <div class="macros-list">
                <div class="macro-row">
                  <div class="macro-dot" style="background:#818cf8"></div>
                  <div class="macro-info">
                    <span class="macro-name">Carbohidratos</span>
                    <span class="macro-val">{{ result()!.macros.carbohidratos_g }}g</span>
                  </div>
                  <span class="macro-pct">{{ result()!.macros.carbohidratos_pct }}%</span>
                </div>
                <div class="macro-row">
                  <div class="macro-dot" style="background:#34d399"></div>
                  <div class="macro-info">
                    <span class="macro-name">Proteínas</span>
                    <span class="macro-val">{{ result()!.macros.proteinas_g }}g</span>
                  </div>
                  <span class="macro-pct">{{ result()!.macros.proteinas_pct }}%</span>
                </div>
                <div class="macro-row">
                  <div class="macro-dot" style="background:#f472b6"></div>
                  <div class="macro-info">
                    <span class="macro-name">Grasas</span>
                    <span class="macro-val">{{ result()!.macros.grasas_g }}g</span>
                  </div>
                  <span class="macro-pct">{{ result()!.macros.grasas_pct }}%</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- EMPTY STATE -->
        <div class="results-col empty-state" *ngIf="!result()">
          <mat-card class="glass-card">
            <mat-card-content class="empty-content">
              <div class="empty-icon"><mat-icon>insights</mat-icon></div>
              <h3>¿Listo para calcular?</h3>
              <p>Ingresa tus datos y selecciona tu objetivo para obtener tu plan nutricional personalizado.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .calc-page { color: white; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 1.75rem; font-weight: 700; margin: 0 0 0.25rem;
    }
    .page-title mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #34d399; }
    .page-subtitle { color: rgba(255,255,255,0.55); margin: 0; }

    .calc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
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
    .card-subtitle { color: rgba(255,255,255,0.5) !important; font-size: 0.8rem !important; }
    .mode-badge {
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; color: white;
    }

    .calc-form { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }



    .modo-section { display: flex; flex-direction: column; gap: 0.5rem; }
    .modo-label { color: rgba(255,255,255,0.6); font-size: 0.8rem; margin: 0; }
    ::ng-deep .modo-group { width: 100%; display: flex !important; background: rgba(255,255,255,0.05) !important; border-radius: 12px !important; }
    ::ng-deep .modo-group .mat-button-toggle { flex: 1; color: rgba(255,255,255,0.5) !important; border: none !important; }
    ::ng-deep .modo-group .mat-button-toggle-checked { background: rgba(124,58,237,0.4) !important; color: #c4b5fd !important; border-radius: 10px !important; }
    ::ng-deep .modo-group .mat-button-toggle-label-content { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; }

    .ratio-preview { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 12px; }
    .ratio-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.7); }
    .ratio-bar { height: 6px; border-radius: 3px; transition: width 0.4s ease; }

    .calc-btn {
      background: linear-gradient(135deg, #059669, #06b6d4) !important;
      color: white !important;
      height: 48px; border-radius: 12px !important;
      font-size: 1rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 16px rgba(5,150,105,0.3) !important;
    }
    .calc-btn:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(5,150,105,0.5) !important; }

    /* RESULTS */
    .results-col { display: flex; flex-direction: column; gap: 1rem; }

    .energy-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .energy-card {
      border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 1rem;
      display: flex; align-items: flex-start; gap: 0.75rem;
      backdrop-filter: blur(12px);
    }
    .energy-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .energy-icon mat-icon { color: white; font-size: 22px; }
    .energy-value { font-size: 1.5rem; font-weight: 700; color: white; }
    .energy-label { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.8); }
    .energy-sub { font-size: 0.68rem; color: rgba(255,255,255,0.4); }

    .macros-content { padding: 0 1rem 1rem !important; display: flex; flex-direction: column; gap: 1rem; }
    .macros-chart-wrap { display: flex; justify-content: center; }

    .macros-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .macro-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.6rem 0.75rem; border-radius: 10px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    }
    .macro-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .macro-info { flex: 1; display: flex; flex-direction: column; }
    .macro-name { font-size: 0.8rem; color: rgba(255,255,255,0.7); }
    .macro-val { font-size: 0.95rem; font-weight: 600; color: white; }
    .macro-pct { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.6); }

    /* EMPTY STATE */
    .empty-state .glass-card { }
    .empty-content {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.75rem; padding: 2.5rem !important; text-align: center;
      color: rgba(255,255,255,0.5);
    }
    .empty-icon {
      width: 64px; height: 64px; border-radius: 20px;
      background: linear-gradient(135deg, rgba(52,211,153,0.2), rgba(6,182,212,0.2));
      border: 1px solid rgba(52,211,153,0.3);
      display: flex; align-items: center; justify-content: center;
    }
    .empty-icon mat-icon { font-size: 32px; width: 32px; height: 32px; color: #34d399; }
    .empty-content h3 { color: white; margin: 0; font-size: 1rem; }
    .empty-content p { margin: 0; font-size: 0.85rem; }
  `],
})
export class CalculatorComponent implements AfterViewInit {
    @ViewChild('macrosChart') macrosChartRef!: ElementRef<HTMLCanvasElement>;
    private chart?: Chart;

    loading = signal(false);
    result = signal<CalculatorResponse | null>(null);

    readonly MODES: Record<string, { label: string; ch: number; pro: number; fat: number }> = {
        mantenimiento: { label: 'Mantenimiento', ch: 50, pro: 25, fat: 25 },
        volumen: { label: 'Volumen', ch: 55, pro: 25, fat: 20 },
        definicion: { label: 'Definición', ch: 35, pro: 40, fat: 25 },
    };

    calcForm: ReturnType<FormBuilder['group']>;

    modoRatios = signal<{ label: string; pct: number; color: string }[]>(this.getRatios('mantenimiento'));

    constructor(
        private fb: FormBuilder,
        private profileService: ProfileService,
        private snack: MatSnackBar,
    ) {
        this.calcForm = this.fb.group({
            peso: [null as number | null, Validators.required],
            talla: [null as number | null, Validators.required],
            edad: [null as number | null, Validators.required],
            sexo: ['masculino', Validators.required],
            modo: ['mantenimiento', Validators.required],
        });

        // Update preview whenever modo changes
        this.calcForm.get('modo')!.valueChanges.subscribe(m => {
            if (m) this.modoRatios.set(this.getRatios(m));
        });
    }

    ngAfterViewInit(): void { }

    private getRatios(modo: string): { label: string; pct: number; color: string }[] {
        const m = this.MODES[modo];
        if (!m) return [];
        return [
            { label: 'Carbohidratos', pct: m.ch, color: '#818cf8' },
            { label: 'Proteínas', pct: m.pro, color: '#34d399' },
            { label: 'Grasas', pct: m.fat, color: '#f472b6' },
        ];
    }

    onCalculate(): void {
        if (this.calcForm.invalid) return;
        this.loading.set(true);
        const val = this.calcForm.value as any;
        this.profileService.calculate(val).subscribe({
            next: (res) => {
                this.loading.set(false);
                this.result.set(res);
                setTimeout(() => this.renderChart(res), 50);
            },
            error: (err) => {
                this.loading.set(false);
                this.snack.open(err.error?.detail ?? 'Error al calcular', 'Cerrar', { duration: 4000 });
            },
        });
    }

    private renderChart(res: CalculatorResponse): void {
        if (!this.macrosChartRef) return;
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(this.macrosChartRef.nativeElement, {
            type: 'doughnut',
            data: {
                labels: ['Carbohidratos', 'Proteínas', 'Grasas'],
                datasets: [{
                    data: [res.macros.carbohidratos_g, res.macros.proteinas_g, res.macros.grasas_g],
                    backgroundColor: ['#818cf8', '#34d399', '#f472b6'],
                    borderColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 2,
                    hoverOffset: 10,
                }],
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${ctx.raw}g`,
                        },
                    },
                },
            },
        });
    }
}
