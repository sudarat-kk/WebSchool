import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface Student {
  id: number;
  rank: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  password?: string;
  affiliation: string;
}

@Component({
  selector: 'app-addstudent',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './addstudent.html',
  // ใช้ styleUrls (Array) เพื่อรองรับ Angular ทุกเวอร์ชัน ป้องกันปัญหา CSS/SCSS ไม่โหลด
  styleUrls: ['./addstudent.scss']
})
export class Addstudent {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  activeTab: 'single' | 'excel' | 'file' = 'single';
  
  // ข้อมูลจำลองรายชื่อนักเรียน
  students: Student[] = [
    { id: 1, rank: 'ร.ต.', firstName: 'สมชาย', lastName: 'ใจดี', studentCode: '67001', affiliation: 'กองพันทหารช่าง' },
    { id: 2, rank: 'ส.อ.', firstName: 'วิชัย', lastName: 'รักชาติ', studentCode: '67002', affiliation: 'กองพันทหารราบ' }
  ];

  // โมเดลสำหรับฟอร์ม
  studentForm: Student = this.getEmptyForm();
  
  // สถานะการแก้ไขและการอัปโหลด
  isEditing: boolean = false;
  editingId: number | null = null;
  excelData: string = '';
  selectedFileName: string = '';

  onCancel(): void {
    this.location.back();
  }

  switchTab(tabId: 'single' | 'excel' | 'file') {
    this.activeTab = tabId;
  }

  // ล้างค่าในฟอร์ม
  resetForm() {
    this.studentForm = this.getEmptyForm();
    this.isEditing = false;
    this.editingId = null;
  }

  private getEmptyForm(): Student {
    return { id: 0, rank: '', firstName: '', lastName: '', studentCode: '', password: '', affiliation: '' };
  }

  // 📝 ฟังก์ชันกดปุ่มแก้ไขรายคน
  onEditStudent(student: Student) {
    this.isEditing = true;
    this.editingId = student.id;
    this.studentForm = { ...student, password: '' }; // ก๊อปปี้ข้อมูลลงฟอร์ม
    this.activeTab = 'single'; // สลับไปแท็บแรกอัตโนมัติเพื่อแก้ไข
    window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนจอขึ้นด้านบน
  }

  // 🗑️ ฟังก์ชันกดปุ่มลบรายคน
  onDeleteStudent(id: number) {
    if (confirm('คุณต้องการลบข้อมูลนักเรียนคนนี้ใช่หรือไม่?')) {
      this.students = this.students.filter(s => s.id !== id);
      if (this.editingId === id) {
        this.resetForm();
      }
    }
  }

  // 💾 ฟังก์ชันบันทึกข้อมูลแบบรายคน (ทั้งเพิ่มใหม่ และแก้ไข)
  onSubmitSingle() {
    if (!this.studentForm.firstName || !this.studentForm.lastName || !this.studentForm.studentCode) {
      alert('กรุณากรอกข้อมูล ชื่อ, นามสกุล และรหัสนักเรียน ให้ครบถ้วน');
      return;
    }

    if (this.isEditing && this.editingId !== null) {
      // อัปเดตข้อมูลเดิม
      const index = this.students.findIndex(s => s.id === this.editingId);
      if (index !== -1) {
        this.students[index] = { ...this.studentForm, id: this.editingId };
      }
    } else {
      // เพิ่มข้อมูลคนใหม่
      const newStudent: Student = {
        ...this.studentForm,
        id: Date.now()
      };
      this.students.push(newStudent);
    }

    this.resetForm();
  }

  // 📋 ฟังก์ชันวางข้อมูลจาก Excel (Tab-separated)
  onSubmitExcel() {
    if (!this.excelData.trim()) {
      alert('กรุณา วางข้อมูลจาก Excel ก่อนทำการบันทึก');
      return;
    }

    const lines = this.excelData.trim().split('\n');
    let addedCount = 0;

    lines.forEach((line, index) => {
      const columns = line.split('\t');
      // ตรวจสอบว่ามีข้อมูลอย่างน้อย 3 คอลัมน์ (ยศ, ชื่อ, นามสกุล)
      if (columns.length >= 3) {
        const newStudent: Student = {
          id: Date.now() + index,
          rank: columns[0]?.trim() || '',
          firstName: columns[1]?.trim() || '',
          lastName: columns[2]?.trim() || '',
          studentCode: columns[3]?.trim() || `ST${Math.floor(1000 + Math.random() * 9000)}`,
          affiliation: columns[4]?.trim() || '-'
        };
        this.students.push(newStudent);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      alert(`นำเข้าข้อมูลสำเร็จทั้งหมด ${addedCount} รายการ`);
      this.excelData = '';
    } else {
      alert('รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบการคัดลอกจาก Excel');
    }
  }

  // 📁 ฟังก์ชันเลือกไฟล์ CSV/TXT
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          this.excelData = text; // อ่านเนื้อหาเข้าแปะในระบบ
        }
      };
      reader.readAsText(file);
    }
  }
}