import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCourseDialog } from '../add-course-dialog/add-course-dialog';
import { AddStudentDialog } from '../add-student-dialog/add-student-dialog';

// Import Services
import { ScoreService, AdminStudentScoreRow } from '../../services/score.service';
import { DropdownService } from '../../services/dropdown.service';

@Component({
  selector: 'app-score-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    RouterLink,
    MatDialogModule,
  ],
  templateUrl: './score-management.html',
  styleUrl: './score-management.scss',
})
export class ScoreManagement implements OnInit {
  // ── UI States ───────────────────────────────────────────────
  isSaving = false;
  isLoading = false;
  saveError: string | null = null;

  // ── Filter selections ──────────────────────────────────────
  selectedCourse: string | 'all' = 'all'; // ใช้ string เพราะจะเก็บ course_name แทน id
  selectedBatch: number | null = null;
  selectedSubjectId: number | null = null;

  // ── Data lists (รับค่าจาก API) ──────────────────────────────
  courses: any[] = []; // หลักสูตรที่กรองชื่อซ้ำแล้วพร้อม batches
  batches: any[] = [];
  subjects: any[] = [];
  studentList: AdminStudentScoreRow[] = [];

  // ── คะแนนเต็มที่แอดมินกรอกเอง ───────────────────────────
  inputMaxScore: number = 100;

  // ── Score stats ────────────────────────────────────────────
  get validScores(): number[] {
    return this.studentList
      .map((s) => Number(s.raw_score))
      .filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  }

  get filledCount(): number {
    return this.validScores.length;
  }

  get averageScore(): string {
    const scores = this.validScores;
    if (scores.length === 0) return '-';
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  }

  get maxScoreValue(): number | null {
    const scores = this.validScores;
    return scores.length > 0 ? Math.max(...scores) : null;
  }

  get minScoreValue(): number | null {
    const scores = this.validScores;
    return scores.length > 0 ? Math.min(...scores) : null;
  }

  // ── Constructor & Init ─────────────────────────────────────
  constructor(
    private dialog: MatDialog,
    private scoreService: ScoreService,
    private dropdownService: DropdownService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    // ไม่ต้องโหลดรุ่นตอนเริ่มต้นแล้ว เพราะบังคับให้เลือกหลักสูตรก่อน
  }

  // ── ดึงหลักสูตรรอบเดียวจบ ──
  loadCourses(): void {
    this.dropdownService.getCourses().subscribe({
      next: (res) => {
        if (res.success) {
          // จัดกลุ่มหลักสูตรที่มีชื่อเหมือนกัน ให้ batches มารวมกัน
          const grouped = new Map<string, any>();
          for (const c of res.data) {
            const name = c.course_name || c.name;
            if (!grouped.has(name)) {
              grouped.set(name, {
                course_name: name,
                batches: c.batches ? [...c.batches] : [],
              });
            } else {
              if (c.batches) {
                grouped.get(name).batches.push(...c.batches);
              }
            }
          }
          this.courses = Array.from(grouped.values());

          this.onCourseChange(); // โหลดเสร็จสั่งให้โชว์รุ่นทั้งหมดเตรียมไว้เลย
          setTimeout(() => this.cdr.detectChanges());
        }
      },
      error: (err) => console.error('Error load courses:', err),
    });
  }

  loadSubjects(): void {
    if (this.selectedBatch) {
      this.dropdownService.getSubjects(this.selectedBatch).subscribe({
        next: (res) => {
          if (res.success) {
            this.subjects = res.data;
            setTimeout(() => this.cdr.detectChanges());
          }
        },
        error: (err) => console.error('Error load subjects:', err),
      });
    }
  }

  // ── เมื่อเปลี่ยนหลักสูตร ──
  onCourseChange(event?: any): void {
    // อัปเดตค่าที่เลือก
    if (event) this.selectedCourse = event.value;

    // เคลียร์ข้อมูลเก่าทิ้งทันที! (แก้บั๊กรุ่นค้าง)
    this.selectedBatch = null;
    this.selectedSubjectId = null;
    this.batches = [];
    this.subjects = [];
    this.studentList = [];

    // ดึงรุ่นมาแสดงใหม่ โดยไม่ต้องรอ API
    if (this.selectedCourse === 'all') {
      // เอา batches ของทุกหลักสูตรมารวมกัน
      this.batches = this.courses.reduce((acc, curr) => acc.concat(curr.batches || []), []);
    } else {
      // เอาเฉพาะ batches ของหลักสูตรที่เลือก (หลังจากเราจับรวม batches ให้แล้วใน loadCourses)
      const foundCourse = this.courses.find((c) => c.course_name === this.selectedCourse);
      this.batches = foundCourse ? foundCourse.batches || [] : [];
    }

    // เรียงลำดับรุ่น
    this.batches.sort((a, b) => {
      const numA = parseInt((a.batch_name || '').replace(/\D/g, ''), 10) || a.batch_id || 0;
      const numB = parseInt((b.batch_name || '').replace(/\D/g, ''), 10) || b.batch_id || 0;
      return numA - numB;
    });
  }

  onBatchChange(): void {
    this.selectedSubjectId = null;
    this.subjects = [];
    this.studentList = [];
    this.loadSubjects();
  }

  onSubjectChange(): void {
    if (!this.selectedSubjectId || !this.selectedBatch) {
      this.studentList = [];
      return;
    }

    // ตั้งคะแนนเต็ม default จากวิชาที่เลือก
    const sub = this.subjects.find((s) => (s.subject_id || s.id) === this.selectedSubjectId);
    this.inputMaxScore = sub?.max_score ?? sub?.maxScore ?? 100;

    // เรียก API ดึงรายชื่อนักเรียนและคะแนนเดิม
    this.isLoading = true;
    this.scoreService.getAdminSubjectScores(this.selectedBatch, this.selectedSubjectId).subscribe({
      next: (res) => {
        if (res.success) {
          // กรองรายชื่อนักเรียนที่ซ้ำกันออก (เผื่อ Database มีข้อมูลซ้ำ)
          const uniqueStudents = new Map<number, any>();
          res.data.forEach((s) => {
            if (!uniqueStudents.has(s.student_id)) {
              uniqueStudents.set(s.student_id, s);
            }
          });
          this.studentList = Array.from(uniqueStudents.values());

          this.inputMaxScore = res.max_score; // อัปเดตคะแนนเต็มตามที่ดึงได้จาก Backend
          setTimeout(() => this.cdr.detectChanges());
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
        this.snackBar.open('ดึงข้อมูลรายชื่อไม่สำเร็จ', 'ปิด', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  onMaxScoreConfirm(): void {
    // Clamp ค่าคะแนนเต็มให้อยู่ในช่วง 1–1000
    if (!this.inputMaxScore || this.inputMaxScore < 1) this.inputMaxScore = 1;
    if (this.inputMaxScore > 1000) this.inputMaxScore = 1000;

    // Re-clamp คะแนนที่กรอกไว้แล้วให้ไม่เกินคะแนนเต็มใหม่
    this.studentList.forEach((s) => {
      if (s.raw_score !== null && Number(s.raw_score) > this.inputMaxScore) {
        s.raw_score = this.inputMaxScore;
      }
    });
  }

  onScoreInput(student: AdminStudentScoreRow): void {
    // Clamp ไม่ให้เกิน inputMaxScore ที่แอดมินกำหนด
    if (student.raw_score !== null && Number(student.raw_score) > this.inputMaxScore) {
      student.raw_score = this.inputMaxScore;
    }
    if (student.raw_score !== null && Number(student.raw_score) < 0) {
      student.raw_score = 0;
    }
  }

  onCancel(): void {
    if (confirm('คุณต้องการยกเลิกการแก้ไขใช่หรือไม่?')) {
      // โหลดข้อมูลจาก Database ใหม่ทับค่าที่แอดมินเพิ่งพิมพ์ไป
      if (this.selectedBatch && this.selectedSubjectId) {
        this.onSubjectChange();
      }
    }
  }

  onSaveScores(): void {
    if (!this.selectedSubjectId || !this.selectedBatch) {
      this.snackBar.open('กรุณาเลือกวิชาและรุ่นก่อนบันทึก', 'ปิด', { duration: 3000 });
      return;
    }

    const unfilled = this.studentList.filter(
      (s) =>
        s.raw_score === null || s.raw_score === undefined || s.raw_score.toString().trim() === '',
    );
    if (unfilled.length > 0) {
      const confirmed = confirm(
        `ยังไม่ได้กรอกคะแนน ${unfilled.length} คน ต้องการบันทึกต่อไปเลยไหม?`,
      );
      if (!confirmed) return;
    }

    this.isSaving = true;
    this.saveError = null;

    // 1. Payload สำหรับอัปเดตคะแนนเต็ม (ส่งไปครบๆ ป้องกัน backend หา record ไม่เจอ)
    const sub = this.subjects.find((s) => (s.subject_id || s.id) === this.selectedSubjectId);
    const actualSettingId = sub?.setting_id || sub?.id || this.selectedSubjectId;

    const updateMaxScorePayload: any = {
      setting_id: actualSettingId,
      subject_id: this.selectedSubjectId,
      batch_id: this.selectedBatch,
      max_score: Number(this.inputMaxScore),
    };

    // 2. Payload สำหรับบันทึกคะแนนดิบ
    const scoresPayload = {
      subject_id: this.selectedSubjectId,
      batch_id: this.selectedBatch,
      scores: this.studentList
        .filter(
          (s) =>
            s.raw_score !== null &&
            s.raw_score !== undefined &&
            s.raw_score.toString().trim() !== '',
        )
        .map((s) => ({
          student_id: s.student_id,
          raw_score: Number(s.raw_score),
        })),
    };

    // ส่งคำขอ API (อัปเดตคะแนนเต็มเสมอ, บันทึกคะแนนนักเรียนถ้ามีคนกรอก)
    const requests: any = {
      maxScore: this.scoreService.updateMaxScore(updateMaxScorePayload)
    };

    if (scoresPayload.scores.length > 0) {
      requests.scores = this.scoreService.saveAdminBulkScores(scoresPayload);
    }

    // ยิง API แบบ Parallel
    forkJoin(requests).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        let msg = `อัปเดตคะแนนเต็ม (${this.inputMaxScore}) สำเร็จ`;
        if (res.scores) {
          msg += ` และบันทึกคะแนนนักเรียน ${res.scores.saved_count ?? scoresPayload.scores.length} คน เรียบร้อย`;
        }
        this.snackBar.open(msg, 'ปิด', { duration: 4000, panelClass: ['snack-success'] });
        
        this.onSubjectChange(); // ดึงข้อมูลใหม่เพื่อรีเฟรชตาราง
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.error?.message || 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง';
        this.snackBar.open(this.saveError!, 'ปิด', { duration: 4000, panelClass: ['snack-error'] });
        console.error('บันทึกคะแนนไม่สำเร็จ:', err);
      },
    });
  }

  addCourse(): void {
    const dialogRef = this.dialog.open(AddCourseDialog, {
      width: '500px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('หลักสูตร/วิชาใหม่:', result);
        this.loadCourses(); // โหลด Dropdown ใหม่เผื่อมีข้อมูลเพิ่ม
      }
    });
  }

  addStudent(): void {
    const dialogRef = this.dialog.open(AddStudentDialog, {
      width: '500px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('นักเรียนใหม่:', result);
        // ถ้าเพิ่มนักเรียนในรุ่นที่กำลังเลือกอยู่ ให้โหลดตารางใหม่
        if (this.selectedBatch && this.selectedSubjectId) {
          this.onSubjectChange();
        }
      }
    });
  }
}
