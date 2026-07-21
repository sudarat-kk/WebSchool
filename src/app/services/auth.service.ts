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

// ==========================================
// 2. Interfaces สำหรับ Admin Authentication
// ==========================================
export interface AdminData {
  admin_id: number;
  email: string;
}

export interface AdminLoginRequest {
  email: string; // 👈 แก้จาก username เป็น email ให้ตรงกับ Backend
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  adminData?: AdminData; // 👈 เพิ่มการรับค่า adminData
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  // ==========================================
  // Student Methods
  // ==========================================

  // ฟังก์ชันยิง API Login
  studentLogin(payload: StudentLoginRequest): Observable<StudentLoginResponse> {
    return this.http.post<StudentLoginResponse>(`${environment.apiUrl}/student-login`, payload);
  }

  saveToken(token: string): void {
    localStorage.setItem('student_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('student_token');
  }

  saveStudentData(data: StudentData): void {
    localStorage.setItem('student_data', JSON.stringify(data));
  }

  getStudentData(): StudentData | null {
    const data = localStorage.getItem('student_data');
    return data ? JSON.parse(data) : null;
  }

  logout(): void {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_data');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ==========================================
  // Admin Methods
  // ==========================================

  // ฟังก์ชันยิง API Login สำหรับแอดมิน
  adminLogin(payload: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${environment.apiUrl}/admin/login`, payload);
  }

  saveAdminToken(token: string): void {
    localStorage.setItem('admin_token', token);
  }

  getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  // 👈 เพิ่มฟังก์ชันบันทึกข้อมูลแอดมิน
  saveAdminData(data: AdminData): void {
    localStorage.setItem('admin_data', JSON.stringify(data));
  }

  // 👈 เพิ่มฟังก์ชันดึงข้อมูลแอดมิน
  getAdminData(): AdminData | null {
    const data = localStorage.getItem('admin_data');
    return data ? JSON.parse(data) : null;
  }

  adminLogout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data'); // 👈 อย่าลืมเคลียร์ข้อมูลตอนล็อกเอาท์ด้วย
  }

  isAdminLoggedIn(): boolean {
    return !!this.getAdminToken();
  }
}
