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

export interface UpdateMaxScoreRequest {
  setting_id: number;
  max_score: number;
}

export interface AdminStudentScore {
  student_id: number;
  student_code: string;
  rank_name: string;
  first_name: string;
  last_name: string;
  raw_score: number | null;
}

export interface AdminSubjectScoresResponse {
  success: boolean;
  max_score: number;
  data: AdminStudentScore[];
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

  // 3. แอดมินดึงรายชื่อนักเรียนพร้อมคะแนนของวิชาที่เลือก (ทั้งห้อง)
  getAdminSubjectScores(batchId: number, subjectId: number): Observable<AdminSubjectScoresResponse> {
    const token = localStorage.getItem('admin_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<AdminSubjectScoresResponse>(
      `${environment.apiUrl}/admin/scores?batch_id=${batchId}&subject_id=${subjectId}`,
      { headers }
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

  // 6. บันทึกคะแนนแบบ Bulk (แอดมิน - ทั้งห้อง)
  saveAdminBulkScores(payload: { batch_id: number; subject_id: number; scores: { student_id: number; raw_score: number | null }[] }): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/admin/scores/bulk`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  // 7. ประมวลผลคะแนนตามกลุ่มวิชา
  getProcessGroupScores(batchId: number, groupId: number): Observable<any> {
    const token = localStorage.getItem('admin_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(
      `${environment.apiUrl}/score/process-group?batch_id=${batchId}&group_id=${groupId}`,
      { headers }
    );
  }
}
