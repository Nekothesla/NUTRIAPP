import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EdamamRecipeResponse {
    from: number;
    to: number;
    count: number;
    _links: any;
    hits: Array<{
        recipe: {
            uri: string;
            label: string;
            image: string;
            source: string;
            url: string;
            yield: number;
            dietLabels: string[];
            healthLabels: string[];
            cautions: string[];
            ingredientLines: string[];
            calories: number;
            totalWeight: number;
            totalTime: number;
            mealType: string[];
            dishType: string[];
            totalNutrients: any;
            totalDaily: any;
            digest: any[];
        };
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class EdamamService {
    // TODO: REEMPLAZAR ESTAS CLAVES CON LAS TUYAS (REPLACE WITH YOUR KEYS)
    private readonly APP_ID = '9775770b';
    private readonly APP_KEY = '7d67c4b731e98f78fdd95f4c89dd2956';
    private readonly API_URL = 'https://api.edamam.com/api/recipes/v2';

    constructor(private http: HttpClient) { }

    searchDiets(query: string, dietType?: string): Observable<EdamamRecipeResponse> {
        let params = new HttpParams()
            .set('type', 'public')
            .set('q', query)
            .set('app_id', this.APP_ID)
            .set('app_key', this.APP_KEY);

        if (dietType) {
            params = params.set('diet', dietType);
        }

        let headers = new HttpHeaders().set('Edamam-Account-User', 'nutriapp-user');

        return this.http.get<EdamamRecipeResponse>(this.API_URL, { params, headers });
    }
}
