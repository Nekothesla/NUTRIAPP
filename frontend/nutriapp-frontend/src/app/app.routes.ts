import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        children: [
            { path: '', redirectTo: 'profile', pathMatch: 'full' },
            {
                path: 'profile',
                loadComponent: () =>
                    import('./features/profile/profile.component').then(m => m.ProfileComponent),
            },
            {
                path: 'calculator',
                loadComponent: () =>
                    import('./features/calculator/calculator.component').then(m => m.CalculatorComponent),
            },
        ],
    },
    { path: '**', redirectTo: 'dashboard' },
];
