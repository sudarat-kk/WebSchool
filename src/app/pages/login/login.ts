import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  hidePassword = true;
  studentCode: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  batchId: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['batchId']) {
        this.batchId = Number(params['batchId']);
      }
    });
  }

  onLogin(): void {
    if (!this.studentCode || !this.password) {
      this.errorMessage = 'กรุณากรอกรหัสนักเรียนและรหัสผ่านให้ครบ';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      batch_id: this.batchId,
      student_code: this.studentCode,
      password: this.password,
    };

    this.authService.studentLogin(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.token) {
          this.authService.saveToken(res.token);
          if (res.studentData) {
            this.authService.saveStudentData(res.studentData);
          }
          // นำผู้ใช้ไปยังหน้าผลคะแนน
          this.router.navigate(['/student/score']);
        } else {
          this.errorMessage = res.message || 'รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        console.error('เข้าสู่ระบบไม่สำเร็จ:', err);
      },
    });
  }
}
