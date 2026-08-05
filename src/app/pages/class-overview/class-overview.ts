import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { DropdownService } from '../../services/dropdown.service';
import { CourseService, CourseGroup } from '../../services/course.service';
import { ScoreService } from '../../services/score.service';
import { StudentGradeDialog, SubjectScoreDetail } from '../student-grade-dialog/student-grade-dialog';
import { SpecialScoreDialog } from '../special-score-dialog/special-score-dialog';

export interface SubjectHeader {
  id: number;
  name: string;
  credit: number;
  groupId?: number | string;
  groupName?: string;
  max_score?: number;
}

export interface SubjectGroupHeader {
  groupId: number | string;
  groupName: string;
  credit: number;
  subjects: SubjectHeader[];
  isSingle: boolean;
}

export interface StudentOverview {
  id: string;
  code: string;
  rank: string;
  name: string;
  subjects: SubjectScoreDetail[];
  totalCredit: number;
  totalScore?: number;
  gpa: string;
  isPassed: boolean;
  group_results?: { [key: string | number]: any };
  trainingTimeScore?: number;
  examTimeScore?: number;
  behaviorScore?: number;
}

@Component({
  selector: 'app-class-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatDialogModule,
    RouterModule
  ],
  templateUrl: './class-overview.html',
  styleUrl: './class-overview.scss'
})
export class ClassOverview implements OnInit {

  // Dropdown States (เงื่อนไขหลัก)
  courses: { id: any; group_name: string }[] = [];
  selectedCourse: any = '';

  batches: { id: any; name: string }[] = [];
  selectedBatch: any = '';

  // Data States
  courseGroups: CourseGroup[] = [];
  students: StudentOverview[] = [];
  masterSubjects: SubjectHeader[] = [];
  subjectGroups: SubjectGroupHeader[] = [];
  
  lastProcessedTime: string = '';
  isLoading: boolean = false;

  constructor(
    private courseService: CourseService,
    private dropdownService: DropdownService,
    private scoreService: ScoreService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.updateProcessedTime();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.courseGroups = res.data;
          this.courses = res.data.map((cg: CourseGroup) => ({
            id: cg.batches?.[0]?.course_id || cg.course_name,
            group_name: cg.course_name
          }));
        }
      },
      error: (err) => console.error('Failed to load courses:', err)
    });
  }

  onCourseChange(): void {
    this.selectedBatch = '';
    this.students = [];
    this.masterSubjects = [];
    this.batches = [];

    if (this.selectedCourse) {
      const courseGroup = this.courseGroups.find(
        (c) => c.batches?.[0]?.course_id == this.selectedCourse || c.course_name === this.selectedCourse
      );

      if (courseGroup && courseGroup.batches && courseGroup.batches.length > 0) {
        this.batches = courseGroup.batches.map((b) => ({
          id: b.batch_id,
          name: b.batch_name || `รุ่นที่ ${b.batch_id}`
        }));
      } else {
        this.dropdownService.getBatches(this.selectedCourse).subscribe({
          next: (res) => {
            if (res?.success && res.data) {
              this.batches = res.data.map((b: any) => ({
                id: b.id || b.batch_id,
                name: b.name || b.batch_name || `รุ่นที่ ${b.id || b.batch_id}`
              }));
            }
          },
          error: (err) => console.error('Failed to load batches:', err)
        });
      }
    }
  }

  onBatchChange(): void {
    if (!this.selectedBatch) {
      this.students = [];
      this.masterSubjects = [];
      return;
    }

    this.isLoading = true;
    const batchId = Number(this.selectedBatch);

    if (isNaN(batchId)) {
      console.error('Invalid batchId:', this.selectedBatch);
      this.isLoading = false;
      return;
    }

    this.scoreService.getBatchScoresSummary(batchId).subscribe({
      next: (res) => {
        if (res?.success) {
          // ใช้งานข้อมูลผลลัพธ์ที่คำนวณจาก Backend โดยตรง
          this.subjectGroups = res.summary.subjectGroups || [];
          this.masterSubjects = (res.summary.masterSubjects || []).map((sub: any) => {
            const group = this.subjectGroups.find(g => g.subjects.some((s: any) => s.id === sub.id));
            return {
              ...sub,
              credit: group ? group.credit : 0,
              groupId: group ? group.groupId : null
            };
          });
          
          const rawStudents = res.data || [];
          
          this.students = rawStudents.map((st: any) => {
            const mappedSubjects = this.masterSubjects.map(sub => {
              const rawScore = st.subject_scores ? st.subject_scores[sub.id] : null;
              
              // ดึงผลการเรียนรวมของกลุ่ม
              let gradeDisplay = '-';
              let indexValue: string | number = '0.00';

              if (sub.groupId && st.group_results && st.group_results[sub.groupId]) {
                 const gResult = st.group_results[sub.groupId];
                 gradeDisplay = gResult.grade;
                 indexValue = gResult.index_value;
              }

              return {
                id: sub.id,
                name: sub.name,
                credit: sub.credit,
                maxScore: sub.max_score,
                rawScore: rawScore,
                grade: gradeDisplay,
                indexValue: indexValue,
                groupId: sub.groupId
              };
            });

            const gpa = st.gpa || "0.00";

            return {
              ...st,
              id: st.student_id || st.id,
              code: st.student_code || st.code,
              name: st.full_name || st.name,
              gpa: gpa,
              isPassed: Number(gpa) >= 2.0,
              subjects: mappedSubjects,
              totalCredit: res.summary.total_credit || 0,
              totalScore: st.total_raw_score || 0,
              group_results: st.group_results || {},
              trainingTimeScore: st.training_time_score ?? st.trainingTimeScore ?? null,
              examTimeScore: st.exam_time_score ?? st.examTimeScore ?? null,
              behaviorScore: st.behavior_score ?? st.behaviorScore ?? null
            };
          });
          
          this.updateProcessedTime();
        } else {
          this.students = [];
          this.masterSubjects = [];
          this.subjectGroups = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching batch scores summary from service:', err);
        this.students = [];
        this.masterSubjects = [];
        this.subjectGroups = [];
        this.isLoading = false;
      }
    });
  }



  getSingleSubjectScore(student: any, grp: any): any {
    if (!student || !grp) return null;
    
    let targetSubId = (grp.subjects && grp.subjects.length > 0) ? grp.subjects[0].id : null;
    if (targetSubId !== null && student.subjects && Array.isArray(student.subjects)) {
      const byId = student.subjects.find((s: any) => s.id === targetSubId);
      if (byId) return byId;
    }
    return null;
  }

  getGroupScore(student: any, grp: any): string {
    if (student.group_results && student.group_results[grp.groupId]) {
      const gResult = student.group_results[grp.groupId];
      return `${gResult.grade} (${gResult.index_value})`;
    }
    return '-';
  }

  getSubjectIndex(sub: SubjectHeader): number {
    return this.masterSubjects.findIndex(s => s.id === sub.id);
  }

  getSelectedCourseName(): string {
    const found = this.courses.find(c => String(c.id) === String(this.selectedCourse));
    return found ? found.group_name : '';
  }

  getSelectedBatchName(): string {
    const found = this.batches.find(b => String(b.id) === String(this.selectedBatch));
    return found ? found.name : '';
  }

  openStudentGradeModal(student: StudentOverview): void {
    this.dialog.open(StudentGradeDialog, {
      data: {
        student,
        courseName: this.getSelectedCourseName(),
        batchName: this.getSelectedBatchName()
      },
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container'
    });
  }

  exportToExcel(): void {
    alert(`ระบบกำลังส่งออกข้อมูล Master Grid ของ ${this.getSelectedBatchName()} เป็นไฟล์ Excel...`);
  }

  reProcess(): void {
    this.updateProcessedTime();
    alert('ระบบทำการประมวลผลสรุปผลการเรียนเรียบร้อยแล้ว!');
  }

  formatGradeWithIndex(sub: SubjectScoreDetail): { gradeDisplay: string; indexDisplay: string; isSU: boolean } {
    if (!sub) {
      return { gradeDisplay: '-', indexDisplay: '', isSU: false };
    }

    const gStr = sub.grade ? String(sub.grade).trim() : '';
    const upperG = gStr.toUpperCase();

    if (upperG === 'S' || upperG === 'U' || upperG === 'P' || upperG === 'F') {
      return {
        gradeDisplay: gStr,
        indexDisplay: '',
        isSU: true
      };
    }

    return {
      gradeDisplay: gStr || (sub.rawScore !== undefined && sub.rawScore !== null ? String(sub.rawScore) : '-'),
      indexDisplay: sub.indexValue && sub.indexValue !== '0.00' ? `(${sub.indexValue})` : '',
      isSU: false
    };
  }

  private updateProcessedTime(): void {
    const now = new Date();
    this.lastProcessedTime = now.toLocaleDateString('th-TH') + ' เวลา ' + now.toLocaleTimeString('th-TH') + ' น.';
  }

  getGradeDescription(score: number | string): string {
    const numScore = Number(score);
    if (isNaN(numScore)) return "";
    if (numScore >= 3.5) return "ดีเลิศ";
    if (numScore >= 3.0) return "ดีมาก";
    if (numScore >= 2.5) return "ดี";
    if (numScore >= 2.0) return "พอใช้";
    return ""; 
  }

  openSpecialScoreModal(): void {
    if (!this.selectedBatch) {
      alert('กรุณาเลือกรุ่นก่อนบันทึกคะแนนพิเศษ');
      return;
    }
    
    const dialogRef = this.dialog.open(SpecialScoreDialog, {
      data: {
        batchId: this.selectedBatch,
        students: this.students.map(st => ({
          id: st.id,
          code: st.code,
          name: st.name,
          rank: st.rank,
          trainingTimeScore: st.trainingTimeScore,
          examTimeScore: st.examTimeScore,
          behaviorScore: st.behaviorScore
        }))
      },
      width: '900px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      disableClose: true 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // หากบันทึกสำเร็จ ให้รีเฟรชข้อมูล (เรียกใช้งานฟังก์ชันดึงข้อมูลเดิม)
        this.reProcess();
      }
    });
  }
}