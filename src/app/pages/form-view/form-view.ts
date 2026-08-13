import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface FormDataItem {
 id: number;
  submittedAt: string; // วันที่ส่ง
  name: string;        // ชื่อ-นามสกุล
  email: string;       // อีเมล
  q1: string;          // คำถาม 1 (เช่น แผนก/ฝ่าย)
  q2: string;          // คำถาม 2 (เช่น ประเภทเรื่อง)
  q3: string;          // คำถาม 3 (เช่น หัวข้อเรื่อง)
  q4: string;          // คำถาม 4 (เช่น รายละเอียด)
  q5: string;
}

@Component({
  selector: 'app-form-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-view.html',
  styleUrl: './form-view.scss',
})
export class FormView {
  formDataList: FormDataItem[] = [
    {
      id: 1,
      submittedAt: '11/08/2026 09:30',
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      q1: 'เทคโนโลยีสารสนเทศ (IT)',
      q2: 'แจ้งปัญหาเทคนิค',
      q3: 'เข้าใช้งานระบบไม่ได้',
      q4: 'พยายามล็อกอินแล้วขึ้นข้อความระบบขัดข้อง Error 500',
      q5: 'ด่วนมาก'
    },
    {
      id: 2,
      submittedAt: '11/08/2026 10:15',
      name: 'นภา สดใส',
      email: 'napha@example.com',
      q1: 'การตลาด (Marketing)',
      q2: 'สอบถามข้อมูล',
      q3: 'ขอใบเสนอราคาแพ็กเกจ',
      q4: 'ต้องการรายละเอียดราคาแพ็กเกจสำหรับองค์กรขนาดใหญ่',
      q5: 'ปกติ'
    },
    {
      id: 3,
      submittedAt: '11/08/2026 11:00',
      name: 'วิชัย มั่นคง',
      email: 'wichai@example.com',
      q1: 'ทรัพยากรบุคคล (HR)',
      q2: 'ข้อเสนอแนะ',
      q3: 'ขอเพิ่มฟังก์ชันการลา',
      q4: 'อยากให้เพิ่มตัวเลือกสิทธิ์การลาครึ่งวันในแบบฟอร์ม',
      q5: 'ปานกลาง'
    }
  ];

  onExport(): void {
    console.log('Exporting data...', this.formDataList);
  }
}

