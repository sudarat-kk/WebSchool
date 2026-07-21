import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ==========================================
// 1. Interfaces สำหรับ Authentication (Login)
// ==========================================
export interface StudentData {
  student_id: number;
  batch_id: number;
  first_name: string;
  last_name: string;
  rank_name: string;
}

export interface StudentLoginRequest {
  batch_id: number;
  student_code: string;
  password: string;
}

export interface StudentLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  studentData?: StudentData;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  // ฟังก์ชันยิง API Login
  studentLogin(payload: StudentLoginRequest): Observable<StudentLoginResponse> {
    return this.http.post<StudentLoginResponse>(
      `${environment.apiUrl}/student-login`,
      payload
    );
  }

  // บันทึก Token ลง localStorage
  saveToken(token: string): void {
    localStorage.setItem('student_token', token);
  }

  // ดึง Token จาก localStorage
  getToken(): string | null {
    return localStorage.getItem('student_token');
  }

  // บันทึกข้อมูลนักเรียนลง localStorage
  saveStudentData(data: StudentData): void {
    localStorage.setItem('student_data', JSON.stringify(data));
  }

  // ดึงข้อมูลนักเรียนจาก localStorage
  getStudentData(): StudentData | null {
    const data = localStorage.getItem('student_data');
    return data ? JSON.parse(data) : null;
  }

  // ออกจากระบบ
  logout(): void {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_data');
  }

// ตรวจสอบว่า Login อยู่หรือไม่
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ==========================================
  // ส่วนของ Admin
  // ==========================================

  // ฟังก์ชันยิง API Admin Login
  adminLogin(payload: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/admin/login`,
      payload
    );
  }

  // บันทึก Admin Token ลง localStorage
  saveAdminToken(token: string): void {
    localStorage.setItem('admin_token', token);
  }

  // ดึง Admin Token จาก localStorage
  getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  // บันทึกข้อมูล Admin ลง localStorage
  saveAdminData(data: any): void {
    localStorage.setItem('admin_data', JSON.stringify(data));
  }

  // ดึงข้อมูล Admin จาก localStorage
  getAdminData(): any | null {
    const data = localStorage.getItem('admin_data');
    return data ? JSON.parse(data) : null;
  }

  // ตรวจสอบว่า Admin Login อยู่หรือไม่
  isAdminLoggedIn(): boolean {
    return !!this.getAdminToken();
  }

  // ออกจากระบบ Admin
  adminLogout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
  }
}
