import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CourseService } from '../../services/course.service';
import { ScoreService } from '../../services/score.service';
import { lastValueFrom } from 'rxjs';

interface GradeItem {
  subject_id: number;
  subjectName: string;
  groupName: string;
  submitDate: string;
  submitTime: string;
  checked: boolean;
  note: string;
  rawDate: Date | null;
}

@Component({
  selector: 'app-score-submission',
  imports: [CommonModule, FormsModule],
  templateUrl: './score-submission.html',
  styleUrl: './score-submission.scss',
})
export class ScoreSubmission implements OnInit {
  summaryData = {
    totalSubjects: 0,
    verifiedSubjects: 0,
    pendingVerifications: 0
  };

  gradeItems: GradeItem[] = [];

  courseGroups: any[] = [];
  filteredBatches: any[] = [];

  selectedCourseName: string = '';
  selectedBatchId: string = '';
  selectedBatchText: string = '';
  exportTimestamp: string = '';

  constructor(
    private location: Location,
    private courseService: CourseService,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
  }

  async loadDropdownData() {
    try {
      const courseRes = await lastValueFrom(this.courseService.getCourses());
      if (courseRes.success) this.courseGroups = courseRes.data;
    } catch (error) {
      console.error('Error loading dropdowns', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลหลักสูตรได้', 'error');
    }
  }

  onCourseChange() {
    this.selectedBatchId = '';
    this.gradeItems = [];
    this.updateSummary();
    if (this.selectedCourseName) {
      const group = this.courseGroups.find(g => g.course_name === this.selectedCourseName);
      this.filteredBatches = group ? group.batches : [];

      // Auto-select the first batch and load its data
      if (this.filteredBatches.length > 0) {
        this.selectedBatchId = this.filteredBatches[0].batch_id.toString();
        this.onBatchChange();
      }
    } else {
      this.filteredBatches = [];
    }
    this.cdr.detectChanges();
  }

  async onBatchChange() {
    if (!this.selectedBatchId) return;
    
    // หาชื่อรุ่นสำหรับแสดงตอนปริ้น
    const batch = this.filteredBatches.find(b => b.batch_id.toString() === this.selectedBatchId);
    if (batch) {
      this.selectedBatchText = batch.batch_name;
    }
    
    try {
      Swal.showLoading();
      const res = await lastValueFrom(this.scoreService.getScoreSubmissions(Number(this.selectedBatchId)));
      Swal.close();

      if (res.success) {
        setTimeout(() => {
          this.gradeItems = res.data.map((item: any) => {
            let dateStr = '';
          let timeStr = '';
          let rawDate: Date | null = null;
          
          if (item.submitted_at) {
            // ข้อมูลจาก DB ส่งมาเป็น string ให้แปลงเป็น Date
            // หากเวลาใน DB ไม่ตรง สามารถชดเชยเวลาได้ แต่เราจะใช้ UTC เป็นหลักเพื่อป้องกันปัญหา
            let dateStrFromDb = item.submitted_at;
            
            // กรณีที่มี Z ต่อท้าย แสดงว่าเป็น UTC, แต่ถ้าข้อมูลเก่าเก็บเป็นเวลาไทยและมี Z จะทำให้เวลาเพี้ยนบวก 7
            // เราจะถือว่ามันคือ UTC และแปลงเป็น local time ปกติ
            const dateObj = new Date(dateStrFromDb);
            rawDate = dateObj;
            
            // Format to Thai Date
            const thaiMonths = [
              'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
              'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
            ];
            dateStr = `${dateObj.getDate()} ${thaiMonths[dateObj.getMonth()]} ${dateObj.getFullYear() + 543}`;
            // หากต้องการให้เวลาเป็นเวลาของไทยเสมอ
            timeStr = dateObj.toLocaleTimeString('th-TH');
          }

          let checked = item.is_submitted === 1 || item.is_submitted === true;
          let note = item.note || '';

          // ตรวจสอบอัตโนมัติหากมีคะแนนในระบบแล้วแต่ลืมติ๊ก
          if (!checked && item.has_scores_in_db) {
            checked = true;
            if (!note) {
              note = 'ระบบพบการลงคะแนนแล้ว (Auto-checked)';
            }
            if (!dateStr) {
              const now = new Date();
              rawDate = now;
              const thaiMonths = [
                'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
              ];
              dateStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
              timeStr = now.toLocaleTimeString('th-TH');
            }
          }

          return {
            subject_id: item.subject_id,
            subjectName: item.subject_name,
            groupName: item.group_name,
            submitDate: dateStr,
            submitTime: timeStr,
            checked: checked,
            note: note,
            rawDate: rawDate,
            has_scores_in_db: item.has_scores_in_db // เก็บไว้เช็คเพิ่มเติมได้
          };
        });
        this.updateSummary();
        this.cdr.detectChanges(); // บังคับให้ Angular อัปเดต UI ทันที
        }, 0);
      }
    } catch (error) {
      Swal.close();
      console.error('Error loading submissions', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลรายวิชาได้', 'error');
    }
  }

  // เรียกใช้เมื่อมีการติ๊ก checkbox เพื่ออัปเดตสรุปผล
  onItemCheckChange(item: GradeItem) {
    if (item.checked && !item.submitDate) {
       // ใส่ค่าเวลาชั่วคราวให้เห็นบน UI ก่อนบันทึก
       const now = new Date();
       item.rawDate = now;
       const thaiMonths = [
         'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
         'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
       ];
       item.submitDate = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
       item.submitTime = now.toLocaleTimeString('th-TH');
    } else if (!item.checked) {
       item.submitDate = '';
       item.submitTime = '';
       item.rawDate = null;
    }
    this.updateSummary();
  }

  updateSummary() {
    this.summaryData.totalSubjects = this.gradeItems.length;
    this.summaryData.verifiedSubjects = this.gradeItems.filter(item => item.checked).length;
    this.summaryData.pendingVerifications = this.summaryData.totalSubjects - this.summaryData.verifiedSubjects;
  }

  goBack() {
    this.location.back();
  }

  exportToPDF() {
    const now = new Date();
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const dateStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
    const timeStr = now.toLocaleTimeString('th-TH');
    
    this.exportTimestamp = `ข้อมูล ณ วันที่: ${dateStr} เวลา: ${timeStr}`;
    this.cdr.detectChanges(); // ให้อัปเดต UI ก่อน
    
    setTimeout(() => {
      window.print();
    }, 100);
  }

  cancelAllSelection() {
    if (this.gradeItems.length === 0) return;
    this.gradeItems.forEach(item => {
      item.checked = false;
      item.submitDate = '';
      item.submitTime = '';
    });
    this.updateSummary();
  }

  async saveVerification() {
    if (!this.selectedBatchId) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือกรุ่นก่อนทำการบันทึก', 'warning');
      return;
    }

    if (this.gradeItems.length === 0) {
      Swal.fire('แจ้งเตือน', 'ไม่มีรายวิชาให้บันทึก', 'warning');
      return;
    }

    try {
      const submissions = this.gradeItems.map(item => {
        let finalDateStr = null;
        if (item.checked) {
          const dateToSave = item.rawDate || new Date();
          // ส่งเป็น UTC Format ไปให้ MySQL เก็บเพื่อป้องกันเวลาเพี้ยนเมื่อดึงกลับมา
          finalDateStr = dateToSave.toISOString().slice(0, 19).replace('T', ' ');
        }

        return {
          subject_id: item.subject_id,
          is_submitted: item.checked ? 1 : 0,
          submitted_at: finalDateStr,
          note: item.note
        };
      });

      Swal.showLoading();
      const res = await lastValueFrom(this.scoreService.saveScoreSubmissions({
        batch_id: Number(this.selectedBatchId),
        submissions: submissions
      }));

      if (res.success) {
        Swal.fire('สำเร็จ!', 'บันทึกการตรวจสอบเรียบร้อยแล้ว', 'success');
        this.onBatchChange(); // Reload data to get actual timestamps from server
      }
    } catch (error) {
      console.error('Error saving', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  }
}
