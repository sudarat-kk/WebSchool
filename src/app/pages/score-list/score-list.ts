import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

interface Subject {
  id: string;
  code: string;
  name: string;
  group: string;
  credit: number;
}

interface Student {
  id: string;
  code: string;
  name: string;
  rawScore: number | null;
  percentage?: number | string;
  creditEarned?: number | string;
  grade?: number | string;
  indexValue?: number | string;
}

@Component({
  selector: 'app-score-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './score-list.html',
  styleUrl: './score-list.scss',
})
export class ScoreList implements OnInit {
  
  selectedStructure: string = 'all';
  selectedBatch: string = '';
  selectedSubject: Subject | null = null;

  batches = [
    { id: 'b66', name: 'รุ่นที่ 66' },
    { id: 'b67', name: 'รุ่นที่ 67' }
  ];

  subjects: Subject[] = [
    { id: 's1', code: 'ค31101', name: 'คณิตศาสตร์พื้นฐาน 1', group: 'กลุ่มวิชาหลัก', credit: 1.5 },
    { id: 's2', code: 'ส31102', name: 'หลักพื้นฐานการรบ', group: 'กลุ่มวิชาทหาร', credit: 2.0 }
  ];

  students: Student[] = [];
  lastProcessedTime: string = '';

  ngOnInit(): void {
    this.updateProcessedTime();
  }

  onStructureChange(): void {
    console.log('โครงสร้างที่เลือก:', this.selectedStructure);
  }

  onBatchChange(): void {
    this.loadStudentList();
  }

  onSubjectChange(): void {
    this.loadStudentList();
  }

  loadStudentList(): void {
    if (this.selectedBatch && this.selectedSubject) {
      this.students = [
        { id: 'st1', code: '66001', name: 'นายสมชาย ดีใจ', rawScore: 0 },
        { id: 'st2', code: '66002', name: 'นางสาวสมศรี เรียนดี', rawScore: 0 },
        { id: 'st3', code: '66003', name: 'นายมานะ ตั้งใจเรียน', rawScore: 0 }
      ];
      this.calculateAllScores();
    } else {
      this.students = [];
    }
  }

  calculateAllScores(): void {
    if (!this.students.length) return;

    this.students.forEach(student => {
      if (student.rawScore !== null && student.rawScore !== undefined) {
        const percent = (student.rawScore / 200) * 100;
        student.percentage = percent.toFixed(1);

        if (percent >= 80) student.grade = '4.0';
        else if (percent >= 75) student.grade = '3.5';
        else if (percent >= 70) student.grade = '3.0';
        else if (percent >= 65) student.grade = '2.5';
        else if (percent >= 60) student.grade = '2.0';
        else if (percent >= 55) student.grade = '1.5';
        else if (percent >= 50) student.grade = '1.0';
        else student.grade = '0.0';

        student.creditEarned = this.selectedSubject ? this.selectedSubject.credit : '-';
        student.indexValue = (Number(student.grade) * Number(student.creditEarned || 0)).toFixed(1);
      } else {
        student.percentage = '-';
        student.creditEarned = '-';
        student.grade = '-';
        student.indexValue = '-';
      }
    });
  }

  reProcess(): void {
    this.calculateAllScores();
    this.updateProcessedTime();
    alert('ประมวลผลคะแนนใหม่เรียบร้อยแล้ว!');
  }

  exportToExcel(): void {
    alert('ระบบกำลังดาวน์โหลดไฟล์ Excel...');
  }

  printReport(): void {
    window.print();
  }

  submitScores(): void {
    alert('บันทึกข้อมูลคะแนนทั้งหมดสำเร็จ!');
  }

  nextPage(): void {
    alert('ระบบกำลังพาคุณไปหน้าถัดไป...');
  }

  private updateProcessedTime(): void {
    const now = new Date();
    this.lastProcessedTime = now.toLocaleDateString('th-TH') + ' เวลา ' + now.toLocaleTimeString('th-TH') + ' น.';
  }
}