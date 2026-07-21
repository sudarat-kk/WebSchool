import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// ==========================================
// Interfaces สำหรับผลการเรียน (Scores & Grades)
// ==========================================
export interface SubjectDetail {
  group_name: string;
  subject_name: string;
  max_score: string;
  raw_score: string;
}

export interface GroupSummary {
  group_name: string;
  credits: string;
  group_max_score: string;
  group_raw_score: string;
  group_percentage: string;
}

export interface ScoreResponse {
  message: string;
  student_id: string | number;
  batch_id?: string | number;
  subject_details: SubjectDetail[];
  group_summaries: GroupSummary[];
}

export interface SingleScoreResponse {
  message: string;
  updated_summaries: GroupSummary[];
}

export interface ScoreItem {
  setting_id: number;
  raw_score: number;
}

export interface BulkScoreRequest {
  student_id: number;
  batch_id: number;
  scores: ScoreItem[];
}

export interface SingleScoreRequest {
  student_id: number;
  batch_id: number;
  setting_id: number;
  raw_score: number;
}

export interface UpdateMaxScoreRequest {
  setting_id: number;
  max_score: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // สร้าง Headers ที่มี Token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // 2. ดึงข้อมูลคะแนนนักเรียน
  getStudentScores(studentId: number, batchId: number): Observable<ScoreResponse> {
    return this.http.get<ScoreResponse>(
      `${environment.apiUrl}/students/${studentId}/scores?batch_id=${batchId}`,
      { headers: this.getHeaders() }
    );
  }

  // 3. บันทึกคะแนนแบบหลายวิชา (Bulk)
  saveBulkScores(payload: BulkScoreRequest): Observable<ScoreResponse> {
    return this.http.post<ScoreResponse>(
      `${environment.apiUrl}/scores/bulk`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  // 4. บันทึกคะแนน 1 วิชา (Single)
  saveSingleScore(payload: SingleScoreRequest): Observable<SingleScoreResponse> {
    return this.http.post<SingleScoreResponse>(
      `${environment.apiUrl}/scores/single`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  // 5. อัปเดตคะแนนเต็มรายวิชา (แอดมิน)
  updateMaxScore(payload: UpdateMaxScoreRequest): Observable<any> {
    return this.http.put<any>(
      `${environment.apiUrl}/settings/max-score`,
      payload,
      { headers: this.getHeaders() }
    );
  }
}
