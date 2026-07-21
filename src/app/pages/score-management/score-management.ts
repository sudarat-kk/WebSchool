import { Component, OnInit } from '@angular/core';
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
import { ScoreService, SingleScoreRequest } from '../../services/score.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  constructor(
    private dialog: MatDialog,
    private dropdownService: DropdownService,
    private scoreService: ScoreService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.dropdownService.getCourses().subscribe({
      next: (res) => {
        if (res && res.data) {
          // Adjust based on actual API response structure
          this.courses = res.data;
        }
      },
      error: (err) => console.error('Failed to load courses', err),
    });
  }

  loadBatches(courseId?: string | null) {
    this.dropdownService.getBatches(courseId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.batches = res.data;
        }
      },
      error: (err) => console.error('Failed to load batches', err),
    });
  }

  loadSubjects(batchId: number) {
    this.dropdownService.getSubjects(batchId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.subjects = res.data;
        }
      },
      error: (err) => console.error('Failed to load subjects', err),
    });
  }

  loadStudents(batchId: number) {
    // Assuming there's an endpoint like this. If not, this might need adjustment.
    this.http.get<any>(`${environment.apiUrl}/students?batch_id=${batchId}`).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.studentList = res.data.map((s: any) => ({
            ...s,
            raw_score: null,
          }));
          this.updateStats();
        }
      },
      error: (err) => console.error('Failed to load students', err),
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

  get averageScore(): string {
    const scores = this.validScores;
    if (scores.length === 0) return '-';
    const sum = scores.reduce((a, b) => a + Number(b), 0);
    return (sum / scores.length).toFixed(2);
  }

  updateStats() {
    const scores = this.validScores;
    this.filledCount = scores.length;
    this.maxScoreValue = scores.length > 0 ? Math.max(...scores) : null;
    this.minScoreValue = scores.length > 0 ? Math.min(...scores) : null;
  }

  onCourseChange() {
    this.selectedBatch = null;
    this.selectedSubjectId = null;
    this.subjects = [];
    this.studentList = [];
    this.updateStats();
    
    if (this.selectedCourse && this.selectedCourse !== 'all') {
      this.loadBatches(this.selectedCourse);
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
      this.loadStudents(this.selectedBatch);
    } else {
      this.subjects = [];
    }
  }

  onSubjectChange() {
    this.updateStats();
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
    if (student.raw_score !== null && student.raw_score > this.inputMaxScore) {
      student.raw_score = this.inputMaxScore;
    }
    this.updateStats();
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
      if (result && this.selectedBatch) {
        this.loadStudents(this.selectedBatch);
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

    this.isSaving = true;
    this.saveError = '';

    // Looop through students and save scores (or use bulk endpoint if one exists for multiple students)
    let completed = 0;
    let hasError = false;
    const studentsToSave = this.studentList.filter((s) => s.raw_score !== null);

    if (studentsToSave.length === 0) {
      this.isSaving = false;
      this.saveError = 'ไม่มีคะแนนให้บันทึก';
      return;
    }

    studentsToSave.forEach((student) => {
      const payload: SingleScoreRequest = {
        student_id: student.student_id,
        batch_id: this.selectedBatch,
        setting_id: this.selectedSubjectId,
        raw_score: student.raw_score!,
      };

      this.scoreService.saveSingleScore(payload).subscribe({
        next: () => {
          completed++;
          if (completed === studentsToSave.length && !hasError) {
            this.isSaving = false;
            alert('บันทึกคะแนนเรียบร้อยแล้ว!');
          }
        },
        error: (err) => {
          hasError = true;
          this.isSaving = false;
          this.saveError = 'เกิดข้อผิดพลาดในการบันทึกคะแนนบางส่วน';
          console.error(err);
        },
      });
    });
  }
}
