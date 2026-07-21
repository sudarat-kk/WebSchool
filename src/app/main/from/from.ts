import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-from',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatButtonModule,
    MatIconModule, 
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './from.html',
  styleUrl: './from.scss',
})
export class From {// สถานะเปิด/ปิดโหมดแก้ไข (false = สร้างใหม่, true = แก้ไข)
  isEditMode: boolean = false;
  selectedFormId: any = null;

  // โครงสร้างตัวแปรสำหรับผูกข้อมูลกับทุกช่องกรอกในฟอร์ม
  formData = {
    course: '',
    formType: '',
    googleFormUrl: '',
    formName: '',
    criteria: '',
    generation: ''
  };

  // 1. ฟังก์ชันเมื่อกดปุ่ม "สร้างและแชร์แบบฟอร์มประเมินนี้"
  onCreateForm() {
    console.log('สร้างฟอร์มใหม่ด้วยข้อมูลนี้:', this.formData);
    // TODO: ส่งข้อมูล formData ไปยัง Backend API หลังบ้านเพื่อทำการบันทึก
    this.resetForm();
  }

  // 2. ฟังก์ชันเมื่อกดปุ่มแก้ไข (ปุ่มรูปดวงตา/แก้ไขจากรายการตารางด้านล่าง)
  onEditAction(mockItem: any) {
    this.isEditMode = true;
    this.selectedFormId = mockItem.id;
    
    // ดึงข้อมูลแถวนั้นๆ มาเติมลงช่องกรอกด้านบนอัตโนมัติ
    this.formData = {
      course: mockItem.course || 'course1',
      formType: mockItem.formType || 'eval1',
      googleFormUrl: mockItem.url || '',
      formName: mockItem.name || '',
      criteria: mockItem.criteria || '',
      generation: mockItem.gen || ''
    };
    
    // เลื่อนหน้าจอกลับขึ้นไปด้านบนเพื่อให้ผู้ใช้เห็นช่องกรอกและแก้ไขได้ทันที
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 3. ฟังก์ชันเมื่อกดปุ่ม "บันทึกการแก้ไขแบบฟอร์ม"
  onUpdateForm() {
    console.log('อัปเดตข้อมูลฟอร์ม ID:', this.selectedFormId, 'เป็นข้อมูลใหม่:', this.formData);
    // TODO: ส่งข้อมูลที่แก้ไขแล้วไปอัปเดตที่ API หลังบ้าน
    
    // เมื่อบันทึกเสร็จ สั่งรีเซ็ตค่าเพื่อกลับสู่โหมดสร้างใหม่ปกติ
    this.resetForm();
  }

  // ฟังก์ชันสําหรับล้างค่าในช่องกรอกให้กลับมาว่างเปล่า
  resetForm() {
    this.isEditMode = false;
    this.selectedFormId = null;
    this.formData = { 
      course: '', 
      formType: '', 
      googleFormUrl: '', 
      formName: '', 
      criteria: '', 
      generation: '' 
    };
  }
}