import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
    id?: number;
    user_id?: number;
    peso: number | null;
    talla: number | null;
    edad: number | null;
    sexo: string | null;
    masa_grasa: number | null;
    masa_muscular: number | null;
    grasa_visceral: number | null;
}

export interface CalculatorRequest {
    peso: number;
    talla: number;
    edad: number;
    sexo: string;
    modo: string;
}

export interface CalculatorResponse {
    geb: number;
    get: number;
    modo: string;
    macros: {
        carbohidratos_g: number;
        proteinas_g: number;
        grasas_g: number;
        carbohidratos_pct: number;
        proteinas_pct: number;
        grasas_pct: number;
    };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
    constructor(private api: ApiService) { }

    getProfile(): Observable<UserProfile> {
        return this.api.get<UserProfile>('/profile/');
    }

    saveProfile(profile: UserProfile): Observable<UserProfile> {
        return this.api.put<UserProfile>('/profile/', profile);
    }

    calculate(req: CalculatorRequest): Observable<CalculatorResponse> {
        return this.api.post<CalculatorResponse>('/calculator/calculate', req);
    }
}
