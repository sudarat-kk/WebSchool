import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 เพิ่มชิ้นนี้เข้ามาเพื่อใช้ [(ngModel)]
import { MatIconModule } from '@angular/material/icon';

// นิยามโครงสร้างข้อมูลวิชา
interface Subject {
  id: number;
  code: string;
  name: string;
  group: string;
  credit: number;
}

@Component({
  selector: 'app-score-management',
  standalone: true, // กำหนดเป็น Standalone component (ในกรณีที่ใช้ Angular 14+)
  imports: [
    CommonModule, 
    FormsModule,     // 👈 ใส่ใน imports list
    MatIconModule
  ],
  templateUrl: './score-management.html',
  styleUrl: './score-management.scss',
})
export class ScoreManagement {
  // 1. ตัวแปรเก็บค่าที่ถูกเลือกใน Dropdown
  selectedStructure: string = 'all';
  selectedSubject: Subject | null = null;

  // 2. ข้อมูลจำลองสำหรับ Dropdown รายวิชา
  subjects: Subject[] = [
    {
      id: 1,
      code: 'ค31101',
      name: 'คณิตศาสตร์พื้นฐาน 1',
      group: 'กลุ่มวิชาหลัก (เน้นทฤษฎี & สอบวัดผล)',
      credit: 1.5
    }
  ];

  constructor() {
    // กำหนดค่าเริ่มต้นให้ Dropdown วิชาเลือกตัวแรกสุด
    if (this.subjects.length > 0) {
      this.selectedSubject = this.subjects[0];
    }
  }

  // 3. ฟังก์ชันการทำงานเมื่อเปลี่ยนโครงสร้างหลักสูตร
  onStructureChange() {
    console.log('โครงสร้างหลักสูตรที่เลือก:', this.selectedStructure);
  }

  // 4. ฟังก์ชันกดปุ่มเพิ่มหลักสูตร / เพิ่มวิชา
  addCourse() {
    console.log('ข้อมูลที่จะบันทึก:', {
      structure: this.selectedStructure,
      subject: this.selectedSubject
    });
    alert('เพิ่มหลักสูตร/เพิ่มวิชา เรียบร้อยแล้ว!');
  }
}