import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { RouterLink, ActivatedRoute } from '@angular/router'; // 👈 นำเข้า ActivatedRoute
import { SubjectService } from '../../services/subject.service';
import { GeneralEvaluationService } from '../../services/general-evaluation.service';
import { Subscription } from 'rxjs';

// สร้าง Interface สำหรับ Card เพื่อให้ผูกข้อมูลกับ HTML ได้ง่ายขึ้น
interface CourseCard {
  id: number;
  text: string;
  status: string; // เช่น 'pending', 'completed' ไว้เปลี่ยนสีจุด status-dot
  formUrl?: string;
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './student.html',
  styleUrl: './student.scss',
})
export class Student implements OnInit, OnDestroy {
  pageTitle: string = 'กำลังโหลดข้อมูล...'; // 👈 เพิ่มตัวแปรเก็บชื่อหัวข้อ H1
  selectedAssessment: string = '';
  currentBatchId: number | null = null;
  private evaluationSub: Subscription | null = null;

  // เก็บข้อมูลรายวิชาทั้งหมดที่ดึงมาจาก API
  allCourses: CourseCard[] = [];

  // เก็บข้อมูลรายวิชาที่จะนำไปแสดงผล (หลังจากค้นหาหรือกรองแล้ว)
  filteredCourses: CourseCard[] = [];

  constructor(
    private subjectService: SubjectService,
    private generalEvaluationService: GeneralEvaluationService,
    private route: ActivatedRoute, // 👈 Inject ActivatedRoute เข้ามาใช้งาน
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    if (this.evaluationSub) {
      this.evaluationSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    // 👈 ใช้ subscribe เพื่อดักจับการเปลี่ยนแปลงของ URL Parameters
    this.route.queryParams.subscribe((params) => {
      const batchId = params['batchId'];
      const title = params['title'];

      // อัปเดตชื่อหัวข้อหลักสูตรตามที่ส่งมาจาก Header
      if (title) {
        this.pageTitle = title;
      }

      // ถ้ามี batchId ส่งมา ให้เรียก API ดึงข้อมูลวิชา
      if (batchId) {
        this.currentBatchId = Number(batchId);
        this.fetchSubjects(this.currentBatchId);
      }
    });
  }

  fetchSubjects(batchId: number): void {
    // เคลียร์ข้อมูลเก่าออกก่อนทุกครั้งที่ดึงข้อมูลรุ่นใหม่
    this.allCourses = [];
    this.filteredCourses = [];
    this.selectedAssessment = '';

    this.subjectService.getSubjectsByBatch(batchId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // ใช้ flatMap เพื่อดึง subjects ออกมาจากทุกๆ group มารวมเป็น Array เดียว
          this.allCourses = res.data.flatMap((group: any) =>
            group.subjects.map((subject: any) => ({
              id: subject.subject_id || subject.id || 0,
              text: subject.subject_name || subject.name || 'ไม่มีชื่อวิชา',
              status: 'pending', // กำหนดสถานะเริ่มต้น (ถ้า API มีสถานะส่งมาด้วย ให้เปลี่ยนตรงนี้)
              formUrl: subject.form_url || '',
            })),
          );
        }
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา:', err);
      },
    });
  }

  // ทำงานเมื่อผู้ใช้เลือกประเภทแบบประเมินใน Dropdown
  onAssessmentChange(event: any): void {
    this.selectedAssessment = event.target.value;

    // ยกเลิก Request เดิมถ้ามีการกดรัวๆ (Race condition)
    if (this.evaluationSub) {
      this.evaluationSub.unsubscribe();
    }

    // value "1" คือ "ประเมินอาจารย์ผู้สอน"
    if (this.selectedAssessment === '1') {
      // นำข้อมูลวิชาทั้งหมดมาแสดง
      this.filteredCourses = [...this.allCourses];
    } else if (this.selectedAssessment === '2' || this.selectedAssessment === '3') {
      const type = this.selectedAssessment === '2' ? 'director' : 'course';
      const titleText = this.selectedAssessment === '2' ? 'แบบประเมินอาจารย์กำกับหลักสูตร' : 'แบบประเมินหลักสูตร';
      
      // เคลียร์หน้าจอให้เป็นช่องว่างก่อนโหลดข้อมูลใหม่
      this.filteredCourses = [];

      if (this.currentBatchId) {
        this.evaluationSub = this.generalEvaluationService.getGeneralEvaluations(this.currentBatchId, type).subscribe({
          next: (res) => {
            let url = '';
            if (res.success && res.data && res.data.length > 0) {
              url = res.data[0].form_url;
            }

            // แสดงการ์ด 1 ใบเสมอ เพื่อให้ผู้ใช้เห็นว่ามีหัวข้อนี้ แต่ลิงก์อาจจะว่างเปล่า
            this.filteredCourses = [{
              id: 0,
              text: titleText,
              status: 'pending',
              formUrl: url,
            }];
            this.cdr.detectChanges(); // 👈 บังคับ Angular อัปเดต UI ทันที
          },
          error: (err) => {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแบบประเมิน:', err);
            // ถ้า Error ก็ยังแสดงการ์ด แต่ไม่มีลิงก์
            this.filteredCourses = [{
              id: 0,
              text: titleText,
              status: 'pending',
              formUrl: '',
            }];
            this.cdr.detectChanges(); // 👈 บังคับ Angular อัปเดต UI ทันที
          }
        });
      }
    } else {
      // ถ้าเลือกข้ออื่น สามารถเพิ่มเงื่อนไข หรือเคลียร์การ์ดทิ้งก่อนได้
      this.filteredCourses = [];
    }
  }

  // ทำงานเมื่อผู้ใช้พิมพ์ค้นหารายวิชาในช่อง Search
  onSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();

    // กรองข้อมูลเฉพาะตอนที่เลือก "ประเมินอาจารย์ผู้สอน" อยู่เท่านั้น
    if (this.selectedAssessment === '1') {
      this.filteredCourses = this.allCourses.filter((course) =>
        course.text.toLowerCase().includes(searchTerm),
      );
    }
  }

  // ทำงานเมื่อกดคลิกที่ Card รายวิชา
  openForm(course: CourseCard): void {
    if (course.formUrl) {
      // เปิดลิงก์แบบฟอร์มในแท็บใหม่
      window.open(course.formUrl, '_blank');
    } else {
      // แจ้งเตือนกรณีรายวิชานั้นยังไม่มีการใส่ฟอร์มลิงก์มาให้
      alert(`ยังไม่มีลิงก์แบบประเมินสำหรับวิชา: ${course.text}`);
    }
  }
}
