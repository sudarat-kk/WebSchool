import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface GradeItem {
  id: number;
  subjectName: string;
  submitDate: string;
  submitTime: string;
  checked: boolean;
  note: string;
}

@Component({
  selector: 'app-score-submission',
  imports: [CommonModule, FormsModule],
  templateUrl: './score-submission.html',
  styleUrl: './score-submission.scss',
})
export class ScoreSubmission {
  // จำลองข้อมูลสำหรับการ์ดสรุป
  summaryData = {
    totalSubjects: 48,
    verifiedSubjects: 35,
    pendingVerifications: 13
  };

  // จำลองข้อมูลสำหรับตาราง
 gradeItems: GradeItem[] = [
    { id: 1, subjectName: 'ฝ่ายอำนวยการ', submitDate: '', submitTime: '', checked: false, note: '' },
    { id: 2, subjectName: 'ฝ่ายอำนวยการทางการสื่อสาร', submitDate: '6 สิงหาคม 2569', submitTime: '15:30:27', checked: true, note: 'ตรวจสอบเรียบร้อย' },
    { id: 3, subjectName: 'ระเบียบการนำหน่วย', submitDate: '', submitTime: '', checked: true, note: 'ผ่านการอนุมัติ' },
    { id: 4, subjectName: 'องค์แทนการสื่อสาร', submitDate: '', submitTime: '', checked: false, note: 'รอยืนยันเอกสาร' },
    { id: 5, subjectName: 'สงครามอิเล็กทรอนิกส์', submitDate: '', submitTime: '', checked: false, note: '' },
  ];

  constructor() { }

  // ฟังก์ชันจำลองสำหรับปุ่มดำเนินการ
  exportToPDF() {
    console.log('ส่งออกเป็น PDF...');
  }

  cancelAllSelection() {
    this.gradeItems.forEach(item => item.checked = false);
    console.log('ยกเลิกการเลือกทั้งหมด');
  }

  saveVerification() {
    const checkedItems = this.gradeItems.filter(item => item.checked);
    console.log('บันทึกการตรวจสอบสำหรับ:', checkedItems);
  }
}
