import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-student-dialog',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './add-student-dialog.html',
  styleUrl: './add-student-dialog.scss',
})
export class AddStudentDialog {
  // รับค่าควบคุมการเปิด/ปิด Pop-up จาก Component หลัก
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  // สถานะของแท็บที่เลือก (ตรงกับเงื่อนไข *ngIf ใน HTML)
  // เริ่มต้นที่แท็บ 'subject' (เพิ่มรายวิชาใหม่)
  activeTab: 'subject' | 'curriculum' = 'subject';

  // ฟังก์ชันสำหรับเปลี่ยนแท็บ (ผูกกับ (click)="switchTab(...)")
  switchTab(tabId: 'subject' | 'curriculum') {
    this.activeTab = tabId;
  }

  // ฟังก์ชันสำหรับปิด Pop-up (ผูกกับ (click)="onClose()")
  onClose() {
    this.close.emit();
  }
}