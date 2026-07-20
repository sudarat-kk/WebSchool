import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService, StudentData } from '../../services/auth.service';
import { ScoreService, SubjectDetail, GroupSummary } from '../../services/score.service';
import { timeout, TimeoutError } from 'rxjs';

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score implements OnInit {
  studentData: StudentData | null = null;
  subjectDetails: SubjectDetail[] = [];
  groupSummaries: GroupSummary[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  // จัดกลุ่ม subjects ตาม group_name
  groupedSubjects: { [key: string]: SubjectDetail[] } = {};
  groupNames: string[] = [];

  constructor(
    private authService: AuthService,
    private scoreService: ScoreService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/student/login']);
      return;
    }

    this.studentData = this.authService.getStudentData();

    if (this.studentData) {
      this.loadScores(this.studentData.student_id, this.studentData.batch_id);
    }
  }

  loadScores(studentId: number, batchId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.scoreService.getStudentScores(studentId, batchId).pipe(
      timeout(30000) // หมดเวลา 30 วินาที
    ).subscribe({
      next: (res) => {
        this.subjectDetails = res.subject_details || [];
        this.groupSummaries = res.group_summaries || [];
        this.buildGroupedSubjects();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err instanceof TimeoutError) {
          this.errorMessage = 'เซิร์ฟเวอร์ใช้เวลานานเกินไป (Server cold start) กรุณากด ลองใหม่';
        } else {
          this.errorMessage = 'ไม่สามารถดึงข้อมูลคะแนนได้ กรุณาลองใหม่อีกครั้ง';
        }
        console.error('ดึงข้อมูลคะแนนไม่สำเร็จ:', err);
      }
    });
  }

  // จัดกลุ่ม subjects ตาม group_name
  buildGroupedSubjects(): void {
    this.groupedSubjects = {};
    for (const subject of this.subjectDetails) {
      if (!this.groupedSubjects[subject.group_name]) {
        this.groupedSubjects[subject.group_name] = [];
      }
      this.groupedSubjects[subject.group_name].push(subject);
    }
    this.groupNames = Object.keys(this.groupedSubjects);
  }

  // คืนค่า GroupSummary ของ group_name นั้น
  getSummaryForGroup(groupName: string): GroupSummary | undefined {
    return this.groupSummaries.find(g => g.group_name === groupName);
  }

  // แปลง String เปอร์เซ็นต์เป็น Number สำหรับ Progress Bar
  getPercentage(summary: GroupSummary | undefined): number {
    if (!summary) return 0;
    return parseFloat(summary.group_percentage) || 0;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
