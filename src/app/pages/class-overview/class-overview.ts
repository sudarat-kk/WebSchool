import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

interface SubjectDetail {
  name: string;
  credit: number;
}

interface StudentOverview {
  id: string;
  code: string;
  rank: string;
  name: string;
  subjects: SubjectDetail[]; // ใช้รูปแบบโครงสร้างแบบวิชาย่อยละเอียด
  totalCredit: number;
  gpa: string;
  isPassed: boolean;
}

@Component({
  selector: 'app-class-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './class-overview.html',
  styleUrl: './class-overview.scss'
})
export class ClassOverview implements OnInit {

  selectedBatch: string = '';
  lastProcessedTime: string = '';

  batches = [
    { id: 'b66', name: 'รุ่นที่ 66' },
    { id: 'b67', name: 'รุ่นที่ 67' }
  ];

  students: StudentOverview[] = [];

  ngOnInit(): void {
    this.updateProcessedTime();
  }

  onBatchChange(): void {
    if (this.selectedBatch) {
      // ตัวอย่างข้อมูลที่มีวิชาเยอะๆ และจำแนกหน่วยกิตแต่ละวิชาตามโจทย์
      this.students = [
        { 
          id: 'st1', 
          code: '66001', 
          rank: 'ร.อ.', 
          name: 'สมชาย ดีใจ', 
          subjects: [
            { name: 'วิชาทหารสื่อสาร', credit: 2 },
            { name: 'การสื่อสารรวม (3 วิชารวมกัน)', credit: 2 },
            { name: 'วิทยุ', credit: 1 },
            { name: 'ระเบียบการนำหน่วย', credit: 2 }
          ],
          totalCredit: 7.0,
          gpa: '3.45',
          isPassed: true 
        },
        { 
          id: 'st2', 
          code: '66002', 
          rank: 'ร.ท.', 
          name: 'สมศรี เรียนดี', 
          subjects: [
            { name: 'วิชาทหารสื่อสาร', credit: 2 },
            { name: 'การสื่อสารรวม (3 วิชารวมกัน)', credit: 2 },
            { name: 'วิทยุ', credit: 1 },
            { name: 'ระเบียบการนำหน่วย', credit: 2 }
          ],
          totalCredit: 7.0,
          gpa: '3.82',
          isPassed: true 
        },
        { 
          id: 'st3', 
          code: '66003', 
          rank: 'ร.ต.', 
          name: 'มานะ พยายาม', 
          subjects: [
            { name: 'วิชาทหารสื่อสาร', credit: 2 },
            { name: 'การสื่อสารรวม (3 วิชารวมกัน)', credit: 2 },
            { name: 'วิทยุ', credit: 1 },
            { name: 'ระเบียบการนำหน่วย', credit: 2 }
          ],
          totalCredit: 7.0,
          gpa: '1.98',
          isPassed: false 
        }
      ];
    } else {
      this.students = [];
    }
  }

  reProcess(): void {
    this.updateProcessedTime();
    alert('ระบบประมวลผลเกรดเฉลี่ยรวม (GPA) รายรุ่นเรียบร้อยแล้ว!');
  }

  exportToExcel(): void {
    alert('ระบบกำลังส่งออกไฟล์สรุปภาพรวมผลการเรียน...');
  }

  printReport(): void {
    window.print();
  }

  private updateProcessedTime(): void {
    const now = new Date();
    this.lastProcessedTime = now.toLocaleDateString('th-TH') + ' เวลา ' + now.toLocaleTimeString('th-TH') + ' น.';
  }
}