import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EvaluationItem {
  form_url: string;
}

export interface GeneralEvaluationResponse {
  success: boolean;
  data: EvaluationItem[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeneralEvaluationService {

  constructor(private http: HttpClient) { }

  getGeneralEvaluations(batchId: number, type: string): Observable<GeneralEvaluationResponse> { 
    return this.http.get<GeneralEvaluationResponse>( 
      `${environment.apiUrl}/general-evaluation/${batchId}?type=${type}` 
    ); 
  }

  createGeneralEvaluation(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/evaluation`, payload);
  }

  updateGeneralEvaluation(id: number | string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/evaluation/${id}`, payload);
  }

  getAllForms(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/evaluation-forms`);
  }
}
