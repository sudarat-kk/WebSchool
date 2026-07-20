import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; 
import { AddCourseDialog } from '../add-course-dialog/add-course-dialog';
import { AddStudentDialog } from '../add-student-dialog/add-student-dialog';


interface Subject {
  id: number;
  code: string;
  name: string;
  group: string;
  credit: number;
}

interface Student {
  id: number;
  code: string;
  name: string;
  rawScore: number | null;
  percentage: number | null;
  creditEarned: number | null;
  grade: string | null;
  indexValue: number | null;
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
    MatDialogModule // 3. ต้องใส่ MatDialogModule ในอาร์เรย์ imports นี้ด้วยครับ
  ],
  templateUrl: './score-management.html',
  styleUrl: './score-management.scss',
})
export class ScoreManagement {
  selectedStructure: string = 'all';
  selectedSubject: Subject | null = null;

  subjects: Subject[] = [
    {
      id: 1,
      code: 'ค31101',
      name: 'คณิตศาสตร์พื้นฐาน 1',
      group: 'กลุ่มวิชาหลัก', 
      credit: 1.5
    }
  ];

  students: Student[] = [
    { id: 1, code: '66001', name: 'นายสมชาย ดีใจ', rawScore: null, percentage: null, creditEarned: null, grade: null, indexValue: null },
    { id: 2, code: '66002', name: 'นางสาวสมศรี เรียนดี', rawScore: null, percentage: null, creditEarned: null, grade: null, indexValue: null },
    { id: 3, code: '66003', name: 'นายมานะ ตั้งใจเรียน', rawScore: null, percentage: null, creditEarned: null, grade: null, indexValue: null }
  ];

  // 4. เพิ่ม `private dialog: MatDialog` เข้าไปใน constructor ของคุณ
  constructor(private dialog: MatDialog) {
    if (this.subjects.length > 0) {
      this.selectedSubject = this.subjects[0];
    }
  }

  get validScores(): number[] {
    return this.students
      .map(s => s.rawScore)
      .filter((score): score is number => score !== null && score >= 0);
  }

  get averageScore(): string {
    const scores = this.validScores;
    if (scores.length === 0) return '-';
    const sum = scores.reduce((a, b) => a + b, 0);
    return (sum / scores.length).toFixed(2);
  }

  get maxScore(): number | null {
    const scores = this.validScores;
    return scores.length > 0 ? Math.max(...scores) : null;
  }

  get minScore(): number | null {
    const scores = this.validScores;
    return scores.length > 0 ? Math.min(...scores) : null;
  }

  onStructureChange() {
    console.log('โครงสร้างหลักสูตรที่เลือก:', this.selectedStructure);
  }

  // 5. อัปเดตฟังก์ชันเพิ่มหลักสูตรให้เปิด Pop-up ของจริง
  addCourse() {
    const dialogRef = this.dialog.open(AddCourseDialog, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('ข้อมูลหลักสูตร/วิชาใหม่จากหน้า Pop-up:', result);
        // ตรงนี้เอาข้อมูล `result` ไปเพิ่มลง array `subjects` หรือส่งไปหลังบ้านได้เลย
      }
    });
  }

  // 6. อัปเดตฟังก์ชันเพิ่มนักเรียนให้เปิด Pop-up ของจริง
  addStudent() {
  const dialogRef = this.dialog.open(AddStudentDialog, { // <-- เติม Component ต่อท้าย
    width: '500px',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('ข้อมูลนักเรียนใหม่จากหน้า Pop-up:', result);
    }
  });
}
  submitScores() {
    const scoreData = this.students.map(student => ({
      studentId: student.id,
      studentCode: student.code,
      rawScore: student.rawScore
    }));
    console.log('ข้อมูลคะแนนส่งเข้าสู่ระบบ:', scoreData);
    alert('บันทึกคะแนนทั้งหมดเข้าสู่ระบบเรียบร้อยแล้ว!');
  }
}