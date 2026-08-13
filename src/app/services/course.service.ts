import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// 1. Import environment เข้ามา (อย่าลืมเช็ค path โฟลเดอร์ให้ถูกต้องนะครับ)
import { environment } from '../../environments/environment';

export interface BatchItem {
  course_id: number;
  curriculum_year: number;
  batch_id: number;
  batch_name: string;
  start_date: string;
}

export interface CourseGroup {
  course_name: string;
  batches: BatchItem[];
}

export interface ApiResponse {
  success: boolean;
  data: CourseGroup[];
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  // 2. เรียกใช้ค่าจาก environment แล้วเอามาต่อ string ด้วย `/courses`
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getSubjectsByBatch(batchId: string | number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/subjects/${batchId}`);
  }

  getAllCourses(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/courses/all`);
  }

  getAllBatches(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/batches/all`);
  }

  getAllSubjectGroups(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/subject-groups/all`);
  }

  addCourse(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/courses`, data);
  }

  addBatch(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/batches`, data);
  }

  updateBatch(id: number | string, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/batches/${id}`, data);
  }

  deleteBatch(id: number | string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/batches/${id}`);
  }

  addSubjectGroup(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/subject-groups`, data);
  }

  addSubject(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/subjects`, data);
  }
}
