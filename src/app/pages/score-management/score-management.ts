import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCourseDialog } from '../add-course-dialog/add-course-dialog';
import { AddStudentDialog } from '../add-student-dialog/add-student-dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { DropdownService } from '../../services/dropdown.service';
import { ScoreService } from '../../services/score.service';
import { CourseService, CourseGroup } from '../../services/course.service';
import { Location } from '@angular/common';

interface Course {
  id: number;
  course_name: string;
}

interface Batch {
  id: number;
  batch_name: string;
}

interface Subject {
  subject_id: number;
  subject_name: string;
}

interface StudentScore {
  student_id: number;
  student_code: string;
  rank_name: string;
  first_name: string;
  last_name: string;
  raw_score: number | null;
}

@Component({
  selector: 'app-score-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatDialogModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './score-management.html',
  styleUrl: './score-management.scss',
})
export class ScoreManagement implements OnInit {
  
  courses: Course[] = [];
  courseGroups: CourseGroup[] = []; // เก็บข้อมูลหลักสูตรดิบจาก API พร้อม batches
  batches: Batch[] = [];
  subjects: Subject[] = [];

  selectedCourse: any = 'all';
  selectedBatch: any = null;
  selectedSubjectId: any = null;
  inputMaxScore: number = 100;

  studentList: StudentScore[] = [];

  filledCount: number = 0;
  maxScoreValue: number | null = null;
  minScoreValue: number | null = null;
  saveError: string = '';
  isSaving: boolean = false;
  isLoading: boolean = false;
  isSaved: boolean = false; // บันทึกสำเร็จแล้ว → แสดงปุ่มวิชาถัดไป

  constructor(
    private dialog: MatDialog,
    private dropdownService: DropdownService,
    private scoreService: ScoreService,
    private courseService: CourseService,
    private location: Location,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  goBack() {
    this.location.back();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.courseGroups = res.data;
          this.courses = res.data.map((c: any) => ({
            id: c.batches?.[0]?.course_id || c.course_name,
            course_name: c.course_name,
          }));
         this.cdr.markForCheck();
        }
      },
      error: (err) => console.error('Failed to load courses', err),
    });
  }

  loadSubjects(batchId: number) {
    this.dropdownService.getSubjects(batchId).subscribe({
      next: (res) => {
        setTimeout(() => {
        if (res && res.data) {
          this.subjects = res.data;
        } else {
          this.subjects = [];
        }
        // ✅ แจ้ง Change Detection แบบปลอดภัย
        this.cdr.markForCheck();
      }, 0);
    },
      error: (err) => console.error('Failed to load subjects', err),
    });
  }

  loadStudents(batchId: number, subjectId: number) {
  this.isLoading = true;

  this.scoreService.getAdminSubjectScores(batchId, subjectId).subscribe({
    next: (res) => {
      // ✅ ใช้ setTimeout (Macrotask) เพื่อรอให้ Render Cycle เดิมทำงานจบก่อน 100%
      setTimeout(() => {
        if (res?.success && res.data) {
          this.studentList = res.data.map((s) => ({
            student_id: s.student_id,
            student_code: s.student_code,
            rank_name: s.rank_name || '',
            first_name: s.first_name,
            last_name: s.last_name,
            raw_score: s.raw_score ?? null,
          }));

          if (res.max_score) {
            this.inputMaxScore = res.max_score;
          }
          this.updateStats();
        }
        this.isLoading = false;
        
        // 💡 ใช้ detectChanges() บังคับซิงค์ View ทันที
        this.cdr.detectChanges();
      }, 0);
    },
    error: (err) => {
      console.error('Failed to load students', err);
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }, 0);
    },
  });
}

  get validScores(): number[] {
    return this.studentList
      .map((s) => s.raw_score)
      .filter(
        (score): score is number =>
          score !== null && score !== undefined && score.toString() !== '',
      );
  }

  /*get averageScore(): string {
    const scores = this.validScores;
    if (scores.length === 0) return '-';
    const sum = scores.reduce((a, b) => a + Number(b), 0);
    return (sum / scores.length).toFixed(2);
  }*/

  // 1. สร้างตัวแปรธรรมดามารับค่า
  averageScore: string = '-';

  updateStats() {
    const scores = this.validScores;
    this.filledCount = scores.length;
    this.maxScoreValue = scores.length > 0 ? Math.max(...scores) : null;
    this.minScoreValue = scores.length > 0 ? Math.min(...scores) : null;

    if (scores.length === 0) {
    this.averageScore = '-';
  } else {
    const sum = scores.reduce((a, b) => a + Number(b), 0);
    this.averageScore = (sum / scores.length).toFixed(2);
  }
  }

  onCourseChange() {
    this.selectedBatch = null;
    this.selectedSubjectId = null;
    this.subjects = [];
    this.studentList = [];
    this.updateStats();

    if (this.selectedCourse && this.selectedCourse !== 'all') {
      // หารุ่นจากข้อมูลที่เก็บไว้ใน courseGroups โดยตรง ไม่ต้องเรียก API ใหม่
      const courseGroup = this.courseGroups.find(
        (c) =>
          c.batches?.[0]?.course_id == this.selectedCourse || c.course_name === this.selectedCourse,
      );
      if (courseGroup) {
        this.batches = courseGroup.batches.map((b) => ({
          id: b.batch_id,
          batch_name: b.batch_name,
        }));
      } else {
        this.batches = [];
      }
    } else {
      this.batches = [];
    }
  }

  onBatchChange() {
    this.selectedSubjectId = null;
    this.studentList = [];
    this.updateStats();
    if (this.selectedBatch) {
      this.loadSubjects(this.selectedBatch);
    } else {
      this.subjects = [];
    }
  }

  // ✅ เพิ่มฟังก์ชันรับค่าเมื่อมีการพิมพ์คะแนนเต็ม
  onMaxScoreChange(newMaxScore: number) {
    this.inputMaxScore = newMaxScore;
  }

  onSubjectChange() {
    setTimeout(() => {
    this.studentList = [];
    this.isSaved = false;
    this.saveError = '';
    this.updateStats();

    if (this.selectedBatch && this.selectedSubjectId) {
      this.loadStudents(this.selectedBatch, this.selectedSubjectId);
    }
    this.cdr.detectChanges();
  }, 0);
}

  onMaxScoreConfirm() {
    // Optionally update max score on backend if required
    if (this.selectedSubjectId) {
      this.scoreService
        .updateMaxScore({
          setting_id: this.selectedSubjectId,
          max_score: this.inputMaxScore,
        })
        .subscribe({
          next: () => console.log('Max score updated'),
          error: (err) => console.error('Failed to update max score', err),
        });
    }
  }

  onScoreInput(student: StudentScore) {
  setTimeout(() => {
    if (student.raw_score !== null && student.raw_score > this.inputMaxScore) {
      student.raw_score = this.inputMaxScore;
    }
    
    this.updateStats();
    this.cdr.markForCheck();
  }, 0);
}

onScoreChange(student: StudentScore, newScore?: any) {
    this.onScoreInput(student);
  }

  addCourse() {
    const dialogRef = this.dialog.open(AddCourseDialog, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCourses();
      }
    });
  }

  addStudent() {
    const dialogRef = this.dialog.open(AddStudentDialog, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedBatch && this.selectedSubjectId) {
        this.loadStudents(this.selectedBatch, this.selectedSubjectId);
      }
    });
  }

  onCancel() {
    this.selectedSubjectId = null;
  }

  onSaveScores() {
    if (!this.selectedSubjectId || !this.selectedBatch) {
      this.saveError = 'กรุณาเลือกรุ่นและรายวิชาก่อนบันทึกคะแนน';
      return;
    }

    const studentsToSave = this.studentList.filter((s) => s.raw_score !== null);

    if (studentsToSave.length === 0) {
      this.saveError = 'ไม่มีคะแนนให้บันทึก';
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const payload = {
      batch_id: this.selectedBatch,
      subject_id: this.selectedSubjectId,
      scores: studentsToSave.map((s) => ({
        student_id: s.student_id,
        raw_score: s.raw_score,
      })),
    };

    this.scoreService.saveAdminBulkScores(payload).subscribe({
      next: (res) => {
        queueMicrotask(() => {
          this.isSaving = false;
          this.isSaved = true;
          this.saveError = '';
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = 'เกิดข้อผิดพลาดในการบันทึกคะแนน';
        console.error(err);
      },
    });
  }

// ✅ เพิ่มฟังก์ชันสำหรับกดปุ่ม "แก้ไขคะแนน"
enableEditMode() {
  this.isSaved = false;
  this.saveError = '';
  this.cdr.markForCheck();
}

  goToNextSubject() {
    const currentIndex = this.subjects.findIndex((s) => s.subject_id === this.selectedSubjectId);
    const nextIndex = currentIndex + 1;
    if (nextIndex < this.subjects.length) {
      this.selectedSubjectId = this.subjects[nextIndex].subject_id;
      this.onSubjectChange();
    }
  }

  get hasNextSubject(): boolean {
    const currentIndex = this.subjects.findIndex((s) => s.subject_id === this.selectedSubjectId);
    return currentIndex >= 0 && currentIndex < this.subjects.length - 1;
  }
}
