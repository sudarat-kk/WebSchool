import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface CourseData {
  id: number;
  name: string;
  cohort62: number;
  cohort63: number;
}

@Component({
  selector: 'app-training-summary',
  imports: [FormsModule, MatSelectModule],
  templateUrl: './training-summary.html',
  styleUrl: './training-summary.scss',
})
export class TrainingSummary {

  selectedCohort: string = 'all';
  chartType: 'bar' | 'line' = 'bar';
  chart: any;

  // ข้อมูลรายวิชา 12 วิชา (เฉพาะ 2 รุ่น: 62 และ 63)
  courses: CourseData[] = [
    { id: 1, name: 'การยิงปืนประจำกาย', cohort62: 88, cohort63: 91 },
    { id: 2, name: 'ยุทธวิธีระดับหมวด', cohort62: 82, cohort63: 87 },
    { id: 3, name: 'การปฐมพยาบาลสนาม', cohort62: 75, cohort63: 83 },
    { id: 4, name: 'ระเบียบแถวและวินัย', cohort62: 85, cohort63: 86 },
    { id: 5, name: 'แผนที่และเข็มทิศ', cohort62: 70, cohort63: 74 },
    { id: 6, name: 'วิชาสื่อสารและเรดาร์', cohort62: 72, cohort63: 65 },
    { id: 7, name: 'วิชาการต้นแบบอาวุธ', cohort62: 68, cohort63: 65 },
    { id: 8, name: 'ความมั่นคงไซเบอร์', cohort62: 60, cohort63: 62 },
    { id: 9, name: 'กฎหมายสงคราม', cohort62: 78, cohort63: 72 },
    { id: 10, name: 'การต่อสู้ระยะประชิด', cohort62: 80, cohort63: 82 },
    { id: 11, name: 'ยุทธวิธีทางน้ำ', cohort62: 65, cohort63: 70 },
    { id: 12, name: 'ส่งกำลังบำรุง', cohort62: 74, cohort63: 71 }
  ];

  ngOnInit(): void {
    // Initial setup if Chart.js or dynamic load is needed
  }

  onCohortChange(): void {
    console.log('Selected Cohort:', this.selectedCohort);
    // Logic สำหรับกรองข้อมูลตามรุ่นที่เลือก
  }

  switchChartType(type: 'bar' | 'line'): void {
    this.chartType = type;
    // Logic สำหรับสลับประเภทกราฟ (Chart.js / Chart render)
  }

  // Helper คำนวณค่าเฉลี่ย
  getAverage(c62: number, c63: number): number {
    return Number(((c62 + c63) / 2).toFixed(1));
  }

  // Helper คำนวณผลต่าง (+/-)
  getDiff(c62: number, c63: number): number {
    return Number((c63 - c62).toFixed(1));
  }
}
