import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DropdownService } from '../../services/dropdown.service';
import { ScoreService } from '../../services/score.service';
import { CourseService, CourseGroup } from '../../services/course.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

interface Batch {
  id: number;
  name: string;
}

interface SubjectItem {
  id?: number;
  subject_id?: number;
  name?: string;
  subject_name?: string;
  group_id?: number;
}

interface SubjectColumn {
  subject_id: number;
  subject_name: string;
  max_score: number;
}

interface StudentResult {
  student_id: number;
  student_code: string;
  full_name: string;
  total_raw_score: string;
  total_max_score: number;
  percent: string;
  grade: string;
  grade_point: number;
  index_value: string;
  subject_scores: { [subjectId: number]: number }; // เก็บพจนานุกรมคะแนนแต่ละวิชา
}

interface GroupSummary {
  group_name: string;
  total_credit: number;
  total_max_score: number;
  subjects_list_text: string;
  subjects: SubjectColumn[]; // เก็บรายวิชาเพื่อเอาไปวนลูปสร้างคอลัมน์
}

@Component({
  selector: 'app-score-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './score-list.html',
  styleUrl: './score-list.scss',
})
export class ScoreList implements OnInit {
  // Dropdown state
  courseGroups: CourseGroup[] = [];
  selectedCourse: any = 'all';
  batches: Batch[] = [];
  selectedBatch: number | null = null;
  subjectsList: SubjectItem[] = [];
  selectedSubjectId: number | null = null;

  // Table data
  students: StudentResult[] = [];
  groupSummary: GroupSummary | null = null;
  lastProcessedTime: string = '';
  isLoading: boolean = false;
  errorMsg: string = '';

  constructor(
    private courseService: CourseService,
    private dropdownService: DropdownService,
    private scoreService: ScoreService,
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
        }
      },
      error: (err) => console.error('Failed to load courses', err),
    });
  }

  onCourseChange(): void {
    this.selectedBatch = null;
    this.selectedSubjectId = null;
    this.batches = [];
    this.subjectsList = [];
    this.students = [];
    this.groupSummary = null;

    if (this.selectedCourse && this.selectedCourse !== 'all') {
      const courseGroup = this.courseGroups.find(
        (c) =>
          c.batches?.[0]?.course_id == this.selectedCourse || c.course_name === this.selectedCourse,
      );
      if (courseGroup) {
        this.batches = courseGroup.batches.map((b) => ({
          id: b.batch_id,
          name: b.batch_name,
        }));
      }
    }
  }

  onBatchChange(): void {
    this.selectedSubjectId = null;
    this.subjectsList = [];
    this.students = [];
    this.groupSummary = null;

    if (this.selectedBatch) {
      this.loadSubjectsDropdown(this.selectedBatch);
    }
  }

  loadSubjectsDropdown(batchId: number): void {
    this.dropdownService.getSubjects(batchId).subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.subjectsList = res.data.map((s: any) => ({
            id: s.id || s.subject_id,
            subject_name: s.subject_name || s.name || 'ไม่มีชื่อวิชา', // 👈 ดักชื่อวิชาไว้
            group_id: s.group_id, // 👈 สำคัญมาก! ต้องเก็บ group_id ของวิชานี้ไว้ด้วย
          }));
          console.log('โหลดรายวิชาสำเร็จ:', this.subjectsList); // แอบดูข้อมูลใน Console
        }
      },
      error: (err) => console.error('Failed to load subjects', err),
    });
  }

  onSubjectChange(): void {
    this.students = [];
    this.groupSummary = null;

    // ค้นหาวิชาที่ผู้ใช้เพิ่งกดเลือกจาก Dropdown
    const selectedSubj = this.subjectsList.find((s) => s.id === this.selectedSubjectId);

    // ถ้าวิชานั้นมี group_id ให้ใช้เลย แต่ถ้าไม่มี ให้ใช้ id ตัวมันเองแทน
    const groupId = selectedSubj?.group_id || selectedSubj?.id;

    if (this.selectedBatch && groupId) {
      this.loadResults(groupId); // ส่ง groupId ไปให้ API Backend คำนวณรวบยอด!
    }
  }

  loadResults(groupId: number): void {
    if (!this.selectedBatch || !groupId) return;
    this.isLoading = true;
    this.errorMsg = '';

    this.scoreService.getProcessGroupScores(this.selectedBatch, groupId).subscribe({
      next: (res) => {
        if (res?.success) {
          this.students = res.data;
          this.groupSummary = res.summary;
          this.updateProcessedTime();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load results', err);
        this.errorMsg = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่';
        this.isLoading = false;
      },
    });
  }

  reProcess(): void {
    // 👈 เปลี่ยนมาหาค่าจาก selectedSubjectId เหมือนกัน
    const selectedSubj = this.subjectsList.find((s) => s.id === this.selectedSubjectId);
    const groupId = selectedSubj?.group_id || selectedSubj?.id;

    if (groupId) {
      this.loadResults(groupId);
    }
  }

  exportToExcel(): void {
    alert('ระบบกำลังดาวน์โหลดไฟล์ Excel...');
  }

  printReport(): void {
    window.print();
  }

  private updateProcessedTime(): void {
    const now = new Date();
    this.lastProcessedTime =
      now.toLocaleDateString('th-TH') + ' เวลา ' + now.toLocaleTimeString('th-TH') + ' น.';
  }
}
