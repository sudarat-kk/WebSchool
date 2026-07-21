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

// ==========================================
// Admin Score Interfaces
// ==========================================
export interface AdminScoreItem {
  student_id: number;
  raw_score: number;
}

export interface AdminBulkScoreRequest {
  subject_id: number; // setting_id / subject id
  batch_id: number;
  scores: AdminScoreItem[];
}

export interface AdminSaveScoreResponse {
  success: boolean;
  message: string;
  saved_count?: number;
}
// ข้อมูลนักเรียนและคะแนนดิบ สำหรับแสดงในตารางหน้า "กรอกคะแนน"
export interface AdminStudentScoreRow {
  student_id: number;
  student_code: string;
  rank_name: string;
  first_name: string;
  last_name: string;
  raw_score: number | null; // ถ้ายังไม่เคยกรอกจะเป็น null
}

export interface AdminGetSubjectScoresResponse {
  success: boolean;
  max_score: number; // ส่งคะแนนเต็มของวิชานี้กลับมาด้วย จะได้เอาไปโชว์ที่หัวตาราง
  data: AdminStudentScoreRow[];
}

// ข้อมูลผลการเรียนที่ประมวลผลแล้ว สำหรับหน้า "ประมวลผลผลการเรียน"
export interface AdminProcessedGradeRow {
  student_id: number;
  student_code: string;
  rank_name: string;
  first_name: string;
  last_name: string;
  total_raw_score: number;
  total_max_score: number;
  percentage: number;
  grade: string;
  index_value: number; // ค่าประกอบ (เกรด * หน่วยกิต)
}

export interface AdminGetProcessedGradesResponse {
  success: boolean;
  group_name: string;
  credits: number;
  data: AdminProcessedGradeRow[];
}

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // สร้าง Headers ที่มี Student Token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // สร้าง Headers ที่มี Admin Token
  private getAdminHeaders(): HttpHeaders {
    const token = this.authService.getAdminToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // 2. ดึงข้อมูลคะแนนนักเรียน
  getStudentScores(studentId: number, batchId: number): Observable<ScoreResponse> {
    return this.http.get<ScoreResponse>(
      `${environment.apiUrl}/students/${studentId}/scores?batch_id=${batchId}`,
      { headers: this.getHeaders() },
    );
  }

  // 3. บันทึกคะแนนแบบหลายวิชา (Bulk)
  saveBulkScores(payload: BulkScoreRequest): Observable<ScoreResponse> {
    return this.http.post<ScoreResponse>(`${environment.apiUrl}/scores/bulk`, payload, {
      headers: this.getHeaders(),
    });
  }

  // 4. บันทึกคะแนน 1 วิชา (Single)
  saveSingleScore(payload: SingleScoreRequest): Observable<SingleScoreResponse> {
    return this.http.post<SingleScoreResponse>(`${environment.apiUrl}/scores/single`, payload, {
      headers: this.getHeaders(),
    });
  }

  // 5. อัปเดตคะแนนเต็มรายวิชา (แอดมิน)
  updateMaxScore(payload: UpdateMaxScoreRequest): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/settings/max-score`, payload, {
      headers: this.getAdminHeaders(),
    });
  }

  // 6. แอดมินบันทึกคะแนนดิบทั้งห้อง (backend คำนวณเอง)
  saveAdminBulkScores(payload: AdminBulkScoreRequest): Observable<AdminSaveScoreResponse> {
    return this.http.post<AdminSaveScoreResponse>(
      `${environment.apiUrl}/admin/scores/bulk`,
      payload,
      { headers: this.getAdminHeaders() },
    );
  }

  getAdminSubjectScores(
    batchId: number,
    subjectId: number,
  ): Observable<AdminGetSubjectScoresResponse> {
    return this.http.get<AdminGetSubjectScoresResponse>(
      `${environment.apiUrl}/admin/scores?batch_id=${batchId}&subject_id=${subjectId}`,
      { headers: this.getAdminHeaders() },
    );
  }

  // 8. แอดมินดึงข้อมูลสรุปเกรดรายหมวดวิชา สำหรับหน้าจอประมวลผล
  getAdminProcessedGrades(
    batchId: number,
    groupId: number,
  ): Observable<AdminGetProcessedGradesResponse> {
    return this.http.get<AdminGetProcessedGradesResponse>(
      `${environment.apiUrl}/admin/grades/process?batch_id=${batchId}&group_id=${groupId}`,
      { headers: this.getAdminHeaders() },
    );
  }
}
