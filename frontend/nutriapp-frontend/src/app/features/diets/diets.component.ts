import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EdamamService, EdamamRecipeResponse } from '../../core/services/edamam.service';

@Component({
  selector: 'app-diets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="diets-container">
      <div class="header-section">
        <h2>Buscador de Dietas y Recetas</h2>
        <p>Encuentra planes de comidas y recetas utilizando la base de datos de Edamam.</p>
      </div>

      <div class="search-section">
        <div class="glass-card">
          <mat-form-field appearance="fill">
            <mat-label>¿Qué deseas comer?</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="searchQuery" placeholder="Ej. Pollo, Ensalada, Pasta..." (keyup.enter)="searchRecipes()">
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Tipo de Dieta</mat-label>
            <mat-select [(ngModel)]="selectedDiet">
              <mat-option value="">Cualquiera</mat-option>
              <mat-option value="balanced">Balanceada</mat-option>
              <mat-option value="high-protein">Alta en Proteína</mat-option>
              <mat-option value="high-fiber">Alta en Fibra</mat-option>
              <mat-option value="low-fat">Baja en Grasa</mat-option>
              <mat-option value="low-carb">Baja en Carbohidratos</mat-option>
              <mat-option value="low-sodium">Baja en Sodio</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-flat-button color="primary" (click)="searchRecipes()" [disabled]="isLoading || !searchQuery">
            <mat-icon>restaurant_menu</mat-icon>
            BUSCAR
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Buscando las mejores recetas...</p>
      </div>

      <div *ngIf="!isLoading && errorMsg" class="loading-container">
        <mat-icon color="warn" style="transform: scale(2);">error</mat-icon>
        <p style="color: #fca5a5; margin-top: 1rem;">{{ errorMsg }}</p>
      </div>

      <div *ngIf="!isLoading && recipes.length > 0" class="results-section">
        <div class="recipe-card" *ngFor="let item of recipes">
          <img [src]="item.recipe.image" [alt]="item.recipe.label" class="recipe-image">
          <div class="recipe-content">
            <h3>{{ item.recipe.label }}</h3>
            <span class="source">Por: {{ item.recipe.source }}</span>
            
            <div class="tags">
              <span class="tag" *ngFor="let diet of item.recipe.dietLabels | slice:0:2">{{ diet }}</span>
            </div>

            <div class="stats">
              <div class="stat" title="Calorías por porción">
                <mat-icon>local_fire_department</mat-icon>
                <span>{{ (item.recipe.calories / item.recipe.yield) | number:'1.0-0' }} kcal</span>
              </div>
              <div class="stat" title="Tiempo de preparación" *ngIf="item.recipe.totalTime > 0">
                <mat-icon>schedule</mat-icon>
                <span>{{ item.recipe.totalTime }} min</span>
              </div>
              <div class="stat" title="Porciones">
                <mat-icon>pie_chart</mat-icon>
                <span>{{ item.recipe.yield }} raciones</span>
              </div>
            </div>
          </div>
          <button mat-button class="view-btn" (click)="openRecipe(item.recipe.url)">VER RECETA</button>
        </div>
      </div>

      <div *ngIf="!isLoading && hasSearched && recipes.length === 0 && !errorMsg" class="loading-container">
        <mat-icon style="transform: scale(2); opacity: 0.5;">search_off</mat-icon>
        <p style="margin-top: 1rem;">No se encontraron recetas. Intenta con otros términos.</p>
      </div>
    </div>
  `,
  styleUrls: ['./diets.component.scss']
})
export class DietsComponent {
  searchQuery: string = '';
  selectedDiet: string = '';
  isLoading: boolean = false;
  hasSearched: boolean = false;
  recipes: any[] = [];
  errorMsg: string = '';

  constructor(private edamamService: EdamamService) {}

  searchRecipes() {
    if (!this.searchQuery.trim()) return;

    this.isLoading = true;
    this.hasSearched = true;
    this.errorMsg = '';
    this.recipes = [];

    this.edamamService.searchDiets(this.searchQuery, this.selectedDiet || undefined).subscribe({
      next: (response: EdamamRecipeResponse) => {
        this.recipes = response.hits;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching recipes:', err);
        if (err.status === 401) {
          this.errorMsg = 'Error de autorización: Verifica tus credenciales (App ID y App Key) de Edamam.';
        } else {
          this.errorMsg = 'Ocurrió un error al buscar recetas. Por favor, intenta de nuevo más tarde.';
        }
        this.isLoading = false;
      }
    });
  }

  openRecipe(url: string) {
    window.open(url, '_blank');
  }
}
