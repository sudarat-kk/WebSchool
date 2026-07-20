import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-course-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-course-dialog.html',
  styleUrl: './add-course-dialog.scss',
})
export class AddCourseDialog {
  @Output() close = new EventEmitter<void>();

  // สถานะปัจจุบัน: 'subject' = เพิ่มรายวิชา, 'curriculum' = เพิ่มหลักสูตร
  activeTab: 'subject' | 'curriculum' = 'subject'; 

  // ฟังก์ชันสลับ Tab
  switchTab(tab: 'subject' | 'curriculum') {
    this.activeTab = tab;
  }

  onClose() {
    this.close.emit();
  }
}
