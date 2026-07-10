import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  // ใส่ URL ของ FastAPI ที่เราทำไว้
  private apiUrl = `${environment.apiUrl}/navigation`;

  constructor(private http: HttpClient) {}

  // สร้างฟังก์ชันสำหรับดึงข้อมูล JSON
  getNavigationData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
