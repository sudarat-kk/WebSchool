import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { MatDialogRef } from '@angular/material/dialog'; 

@Component({
  selector: 'app-add-course-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-course-dialog.html',
  styleUrl: './add-course-dialog.scss',
})
export class AddCourseDialog {
  // สถานะปัจจุบัน: 'subject' = เพิ่มรายวิชา, 'curriculum' = เพิ่มหลักสูตร
  activeTab: 'subject' | 'curriculum' = 'subject'; 
  dialog: any;

  // 👈 2. Inject MatDialogRef เข้ามาใน constructor ตรงนี้
  constructor(public dialogRef: MatDialogRef<AddCourseDialog>) {}

 openDialog() {
  this.dialog.open(AddCourseDialog, {
    width: '780px',    // 👈 บังคับความกว้างขยายออกตรงนี้เลยครับ!
    maxWidth: '95vw',
  });
}

  // ฟังก์ชันสลับ Tab
  switchTab(tab: 'subject' | 'curriculum') {
    this.activeTab = tab;
  }

  // ✨ ฟังก์ชันสำหรับกดปุ่มกากบาท (X) แล้วปิด Dialog
  onClose(): void {
    this.dialogRef.close(); 
  }
}